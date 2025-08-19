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
    imageUrl?: string;
    author?: Author;
}

interface ExtractedBasicData {
    theme?: string;
    title?: string;
    subtitle?: string;
    publicationDate?: string;
    articleContentHtml?: string;
}

const window = new JSDOM('').window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DOMPurify = createDOMPurify(window as any);

export interface INewsProvider {
    fetchArticleData(
        url: string,
        strategy: 'cheerio' | 'puppeteer'
    ): Promise<Partial<NewsArticle> | null>;
    
    close(): Promise<void>;
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
        image: 'desktop.imgPadrao img',
        
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

            if (!rawData) {
                console.warn(`❌ Nenhum dado extraído da URL: ${url} usando ${strategy}`);
                return null;
            }
            
            if (!rawData.title || rawData.title.trim().length === 0) {
                console.warn(`⚠️ Título não encontrado ou vazio na URL: ${url} usando ${strategy}`);
                return null;
            }
            
            if (!rawData.articleContentHtml || rawData.articleContentHtml.trim().length === 0) {
                console.warn(`⚠️ Conteúdo não encontrado ou vazio na URL: ${url} usando ${strategy}`);
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
        
        const result = {
            theme: rawData.theme || undefined,
            title: rawData.title || '',
            subtitle: rawData.subtitle || undefined,
            publicationDate: rawData.publicationDate ? new Date(rawData.publicationDate) : undefined,
            articleContent: sanitizedArticleBody || '',
            imageUrl: rawData.imageUrl || undefined,
            author: rawData.author || undefined,
            font: this.font || '',
        };
        
        console.log(`📝 Dados extraídos:`, {
            title: result.title || 'N/A',
            theme: result.theme || 'N/A',
            hasContent: !!result.articleContent,
            contentLength: result.articleContent?.length || 0,
            hasImage: !!result.imageUrl,
            imageUrl: result.imageUrl || 'N/A',
            hasAuthor: !!result.author,
            font: result.font || 'N/A'
        });
        
        return result;
    }

    private async sanitizeArticleContent(content: string): Promise<string> {
        if (!content || content.trim().length === 0) {
            console.warn('⚠️ Conteúdo HTML vazio ou nulo recebido para sanitização');
            return '';
        }
        
        const cleanContent = DOMPurify.sanitize(content, { 
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'],
            ALLOWED_ATTR: []
        });
        
        const trimmedContent = cleanContent.trim();
        console.log(`🧹 Conteúdo sanitizado: ${trimmedContent.length} caracteres`);
        
        return trimmedContent;
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

        console.log(`🔍 Fazendo scraping da URL: ${url} com Cheerio`);
        const { data } = await axios.get(url, config);
        const $ = cheerio.load(data);
        
        const articleSection = $(this.selector.articleSection);
        if (!articleSection.length) return null;

        return this.extractArticleData(articleSection, $, 'Cheerio');
    }

    private extractAuthorData($: cheerio.CheerioAPI): Author | undefined {
        const authorSection = $(this.selector.authorSection);
        if (!authorSection.length) return undefined;

        const authorName = authorSection.find(this.selector.authorName).text().trim();
        if (!authorName) return undefined;

        const relativePhotoUrl = authorSection.find(this.selector.authorPhoto).attr('src');
        const relativeMoreArticlesLink = authorSection.find(this.selector.moreArticlesLink).attr('href');
        
        return {
            name: authorName,
            photo: relativePhotoUrl ? new URL(relativePhotoUrl, this.baseUrl).href : undefined,
            moreArticlesLink: relativeMoreArticlesLink ? new URL(relativeMoreArticlesLink, this.baseUrl).href : undefined,
        };
    }

    private extractBasicArticleData(articleSection: cheerio.Cheerio<any>): ExtractedBasicData {
        return {
            theme: articleSection.find(this.selector.theme).text().trim() || undefined,
            title: articleSection.find(this.selector.title).text().trim() || undefined,
            subtitle: articleSection.find(this.selector.subtitle).text().trim() || undefined,
            publicationDate: articleSection.find(this.selector.publicationDate).attr('content') || undefined,
            articleContentHtml: articleSection.find(this.selector.articleContent).html() || undefined,
        };
    }

    private extractImageData(articleSection: cheerio.Cheerio<any>): string | undefined {
        const imageElement = articleSection.find(this.selector.image);
        if (!imageElement.length) {
            console.log(`⚠️ Nenhuma imagem encontrada na classe imgPadrao`);
            return undefined;
        }

        const relativeImageUrl = imageElement.attr('src');
        if (!relativeImageUrl) return undefined;

        const imageUrl = new URL(relativeImageUrl, this.baseUrl).href;
        console.log(`🖼️ Imagem encontrada: ${imageUrl}`);
        return imageUrl;
    }

    private extractArticleData(articleSection: cheerio.Cheerio<any>, $: cheerio.CheerioAPI, strategy: 'Cheerio'): RawArticleData {
        const author = this.extractAuthorData($);
        
        const basicData = this.extractBasicArticleData(articleSection);
        const imageUrl = this.extractImageData(articleSection);
        
        console.log(`📰 Dados extraídos com ${strategy}:`, {
            theme: basicData.theme || 'N/A',
            title: basicData.title || 'N/A',
            subtitle: basicData.subtitle || 'N/A',
            hasContent: !!basicData.articleContentHtml,
            contentLength: basicData.articleContentHtml?.length || 0,
            hasImage: !!imageUrl,
            imageUrl: imageUrl || 'N/A'
        });
        
        return {
            theme: basicData.theme || undefined,
            title: basicData.title || undefined,
            subtitle: basicData.subtitle || undefined,
            publicationDate: basicData.publicationDate || undefined,
            articleContentHtml: basicData.articleContentHtml || undefined,
            imageUrl: imageUrl,
            author: author,
        };
    }

    private async scrapeWithPuppeteer(url: string): Promise<RawArticleData | null> {
        const browser = await this.initPuppeteer();
        let page: Page | null = null;
        
        try {
            page = await browser.newPage();
            console.log(`🌐 Navegando para: ${url} com Puppeteer`);
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
           
                const theme = (articleSection.querySelector(selector.theme) as HTMLElement)?.innerText.trim();
                const title = (articleSection.querySelector(selector.title) as HTMLElement)?.innerText.trim();
                const subtitle = (articleSection.querySelector(selector.subtitle) as HTMLElement)?.innerText.trim();
                const publicationDate = (articleSection.querySelector(selector.publicationDate) as HTMLMetaElement)?.content;
                const articleContentHtml = articleSection.querySelector(selector.articleContent)?.innerHTML;
                

                const imageElement = articleSection.querySelector(selector.image) as HTMLImageElement;
                let imageUrl: string | undefined = undefined;
                
                if (imageElement && imageElement.src) {
                    if (imageElement.src.startsWith('http')) {
                        imageUrl = imageElement.src;
                    } else {
                        imageUrl = new URL(imageElement.src, baseUrl).href;
                    }
                }
                
                return {
                    theme: theme || undefined,
                    title: title || undefined,
                    subtitle: subtitle || undefined,
                    publicationDate: publicationDate || undefined,
                    articleContentHtml: articleContentHtml || undefined,
                    imageUrl: imageUrl,
                    author: author,
                };
            }, this.selector, this.baseUrl); 

            if (extractedData) {
                const processedData = this.processExtractedData(extractedData, 'Puppeteer');
                return processedData;
            }
            return null;
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    private processExtractedData(data: RawArticleData, strategy: 'Puppeteer'): RawArticleData {
        if (data.imageUrl) {
            console.log(`🖼️ Imagem encontrada: ${data.imageUrl}`);
        } else {
            console.log(`⚠️ Nenhuma imagem encontrada na classe imgPadrao`);
        }
        
        console.log(`📰 Dados extraídos com ${strategy}:`, {
            theme: data.theme || 'N/A',
            title: data.title || 'N/A',
            subtitle: data.subtitle || 'N/A',
            hasContent: !!data.articleContentHtml,
            contentLength: data.articleContentHtml?.length || 0,
            hasImage: !!data.imageUrl,
            imageUrl: data.imageUrl || 'N/A'
        });
        
        return data;
    }
}