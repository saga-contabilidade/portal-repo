import { NewsArticle } from '@/modules/scraping/domain/entities/newsArticle';
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

interface Author {
    name: string;
    photo?: string;
    moreArticlesLink?: string;
}

interface RawArticleData {
    theme?: string;
    title?: string;
    subtitle?: string;
    publicationDate?: string;
    articleContentHtml?: string;
    author?: Author;
}

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

export interface INewsProvider {
    fetchArticleData(
        url: string,
        strategy: 'cheerio' | 'puppeteer'
    ): Promise<Partial<NewsArticle> | null>;
}

export class WebScraperProvider implements INewsProvider {
    private browser: Browser | null = null;
    
    private readonly baseUrl = 'https://www.contabeis.com.br';
    private readonly font = 'contabeis.com.br';

    private readonly selector = {
        articleSection: '.detalhesMateria',
        theme: 'p.chapeu',
        title: 'h1[itemprop="headline"]',
        subtitle: 'h2.linhadeOlho',
        publicationDate: 'meta[itemprop="dateModified"]',
        articleContent: 'div[itemprop="articleBody"]',
        
        authorSection: '.autorMateria',
        authorPhoto: '.imagemAutor img',
        authorName: '.textoAutor',
        moreArticlesLink: "a.botaoMais:contains('mais matérias')",
    };

    private async initPuppeteer(): Promise<Browser> {
        if (!this.browser) {
            console.log('Iniciando instância do Puppeteer...');
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }
        return this.browser;
    }

    public async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log('Instância do Puppeteer fechada.');
        }
    }

    public async fetchArticleData(
        url: string,
        strategy: 'cheerio' | 'puppeteer'
    ): Promise<Partial<NewsArticle> | null> {
        try {
            let rawData: RawArticleData | null = null;
            if (strategy === 'puppeteer') {
                rawData = await this.scrapeWithPuppeteer(url);
            } else {
                rawData = await this.scrapeWithCheerio(url);
            }

            if (!rawData || !rawData.title || !rawData.articleContentHtml) {
                console.warn(`Título ou conteúdo não encontrado na URL: ${url} usando ${strategy}`);
                return null;
            }

            return await this._buildResult(rawData);

        } catch (error) {
            console.error(`Falha ao fazer scraping da URL ${url} com a estratégia ${strategy}:`, error);
            return null;
        }
    }

    private async _buildResult(rawData: RawArticleData): Promise<Partial<NewsArticle>> {
        const sanitizedArticleBody = await this.sanitizeArticleContent(rawData.articleContentHtml || '');
        
        return {
            theme: rawData.theme,
            title: rawData.title,
            subtitle: rawData.subtitle,
            publicationDate: rawData.publicationDate ? new Date(rawData.publicationDate) : undefined,
            articleContent: sanitizedArticleBody,
            author: rawData.author,
            font: this.font,
        };
    }

    private async sanitizeArticleContent(content: string): Promise<string> {
        const cleanContent = DOMPurify.sanitize(content, { /* ... */ });
        return cleanContent.trim();
    }
    
    private async scrapeWithCheerio(url: string): Promise<RawArticleData | null> {
        
        const config: AxiosRequestConfig = {
            headers: {  
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', 
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 15000,

        };

        const { data } = await axios.get(url, config);
        const $ = cheerio.load(data);
        
        const articleSection = $(this.selector.articleSection);
        if (!articleSection.length) return null;

        const authorSection = $(this.selector.authorSection);
        let author: Author | undefined = undefined;

        if (authorSection.length) {
            const authorName = authorSection.find(this.selector.authorName).text().trim();
            if (authorName) {
                const relativePhotoUrl = authorSection.find(this.selector.authorPhoto).attr('src');
                const relativeMoreArticlesLink = authorSection.find(this.selector.moreArticlesLink).attr('href');
                author = {
                    name: authorName,
                    photo: relativePhotoUrl ? new URL(relativePhotoUrl, this.baseUrl).href : undefined,
                    moreArticlesLink: relativeMoreArticlesLink ? new URL(relativeMoreArticlesLink, this.baseUrl).href : undefined,
                };
            }
        }
        
        return {
            theme: articleSection.find(this.selector.theme).text().trim(),
            title: articleSection.find(this.selector.title).text().trim(),
            subtitle: articleSection.find(this.selector.subtitle).text().trim(),
            publicationDate: articleSection.find(this.selector.publicationDate).attr('content'),
            articleContentHtml: articleSection.find(this.selector.articleContent).html() || undefined,
            author: author,
        };
    }

    private async scrapeWithPuppeteer(url: string): Promise<RawArticleData | null> {
        const browser = await this.initPuppeteer();
        let page: Page | null = null;
        
        try {
            page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            const extractedData = await page.evaluate((selector, baseUrl) => {
                const articleSection = document.querySelector(selector.articleSection);
                if (!articleSection) return null;

                let author: Author | undefined = undefined;
                const authorSection = document.querySelector(selector.authorSection);
                if (authorSection) {
                    const authorName = (authorSection.querySelector(selector.authorName) as HTMLElement)?.innerText.trim();
                    if (authorName) {
                        const photoSrc = (authorSection.querySelector(selector.authorPhoto) as HTMLImageElement)?.src; 
                        const relativeMoreArticlesLink = (authorSection.querySelector(selector.moreArticlesLink) as HTMLAnchorElement)?.getAttribute('href');
                        
                        author = {
                            name: authorName,
                            photo: photoSrc, 
                            moreArticlesLink: relativeMoreArticlesLink ? new URL(relativeMoreArticlesLink, baseUrl).href : undefined
                        };
                    }
                }

                return {
                    theme: (articleSection.querySelector(selector.theme) as HTMLElement)?.innerText.trim(),
                    title: (articleSection.querySelector(selector.title) as HTMLElement)?.innerText.trim(),
                    subtitle: (articleSection.querySelector(selector.subtitle) as HTMLElement)?.innerText.trim(),
                    publicationDate: (articleSection.querySelector(selector.publicationDate) as HTMLMetaElement)?.content,
                    articleContentHtml: articleSection.querySelector(selector.articleContent)?.innerHTML,
                    author: author,
                };
            }, this.selector, this.baseUrl); 

            return extractedData;

        } finally {
            if (page) {
                await page.close();
            }
        }
    }
}