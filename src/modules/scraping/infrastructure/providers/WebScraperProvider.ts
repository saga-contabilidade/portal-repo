import { NewsArticle } from '@/modules/scraping/domain/entities/newsArticle';
import axios, { AxiosRequestConfig } from 'axios';
import { load, Cheerio, CheerioAPI } from 'cheerio';
import { Element } from 'domhandler';
import puppeteer, { Browser, Page } from 'puppeteer';
import { JSDOM } from 'jsdom';
import createDOMPurify, { DOMPurify, WindowLike } from 'dompurify';
import { parsePublicationDate } from '@/utils/Date.helpers';
import { emptyToUndefined, escapeRegex } from '@/utils/String.helpers';
import { safeAbsoluteUrl, toAbsoluteUrl } from '@/utils/Url.helpers';

export interface Author {
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

const { window } = new JSDOM('');
const DOMPurifyInstance: DOMPurify = createDOMPurify(window as unknown as WindowLike);
export { DOMPurifyInstance };

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

  private readonly axiosConfig: AxiosRequestConfig = {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
    },
    timeout: 15000,
    decompress: true,
    maxRedirects: 5,
    validateStatus: (s) => s >= 200 && s < 400,
  };

  private readonly selector = {
    articleSection: '.detalhesMateria',
    theme: 'p.chapeu',
    title: 'h1[itemprop="headline"]',
    subtitle: 'h2.linhadeOlho',
    publicationDate: 'meta[itemprop="dateModified"]',
    articleContent: 'div[itemprop="articleBody"]',
    image: 'script:contains("var conteudoMateria")',
    authorSection: '.autorMateria',
    authorPhoto: '.imagemAutor img',
    authorName: '.textoAutor',
    moreArticlesLink: "a.botaoMais:contains('mais matérias')",
  } as const;

  private async initPuppeteer(): Promise<Browser> {
    if (!this.browser) {
      log.debug('Iniciando instância do Puppeteer...');
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
      log.debug('Instância do Puppeteer fechada.');
    }
  }

  public async fetchArticleData(
    url: string,
    strategy: 'cheerio' | 'puppeteer'
  ): Promise<Partial<NewsArticle> | null> {
    try {
      const normalizedUrl = toAbsoluteUrl(url, this.baseUrl);
      const html =
        strategy === 'puppeteer'
          ? await this.fetchHtmlWithPuppeteer(normalizedUrl)
          : await this.fetchHtmlWithCheerio(normalizedUrl);

      if (!html) {
        log.warn(`Não foi possível obter o HTML da URL: ${normalizedUrl} usando ${strategy}`);
        return null;
      }

      const rawData = this.parseHtmlAndExtractData(html, strategy);
      if (!rawData || !rawData.title || !rawData.articleContentHtml) {
        log.warn(`Dados essenciais (título/conteúdo) não encontrados na URL: ${normalizedUrl}`);
        return null;
      }

      return await this.buildResult(rawData);
    } catch (error) {
      log.error(`Falha ao fazer scraping da URL ${url} com a estratégia ${strategy}:`, error);
      return null;
    }
  }

  private async buildResult(rawData: RawArticleData): Promise<Partial<NewsArticle>> {
    const sanitizedArticleBody = await this.sanitizeArticleContent(rawData.articleContentHtml ?? '');

    const result: Partial<NewsArticle> = {
      theme: emptyToUndefined(rawData.theme),
      title: rawData.title ?? '',
      subtitle: emptyToUndefined(rawData.subtitle),
      publicationDate: parsePublicationDate(rawData.publicationDate),
      articleContent: sanitizedArticleBody ?? '',
      imageUrl: emptyToUndefined(rawData.imageUrl),
      author: rawData.author,
      font: this.font,
    } as Partial<NewsArticle>;

    log.debug('Dados extraídos e prontos:', {
      title: result.title || 'N/A',
      theme: (result as any).theme || 'N/A',
    });

    return result;
  }

  private async sanitizeArticleContent(content: string): Promise<string> {
    if (!content || !content.trim()) {
      log.warn('Conteúdo HTML vazio ou nulo recebido para sanitização');
      return '';
    }

    const clean = DOMPurifyInstance.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel']
    }) as string;

    const $ = load(clean);
    $('a[target="_blank"]').each((_, el) => {
      const rel = $(el).attr('rel');
      if (!rel || !/noopener|noreferrer/.test(rel)) {
        $(el).attr('rel', 'noopener noreferrer');
      }
    });

    return $.root().html()!.trim();
  }

  private extractAuthorData($: CheerioAPI): Author | undefined {
    const authorSection = $(this.selector.authorSection);
    if (!authorSection.length) return undefined;

    const authorName = authorSection.find(this.selector.authorName).text().trim();
    if (!authorName) return undefined;

    const relativePhotoUrl = authorSection.find(this.selector.authorPhoto).attr('src');
    const relativeMoreArticlesLink = authorSection.find(this.selector.moreArticlesLink).attr('href');

    return {
      name: authorName,
      photo: safeAbsoluteUrl(relativePhotoUrl, this.baseUrl),
      moreArticlesLink: safeAbsoluteUrl(relativeMoreArticlesLink, this.baseUrl),
    };
  }

  private extractBasicArticleData(
    articleSection: Cheerio<Element>,
  ): ExtractedBasicData {
    return {
      theme: emptyToUndefined(articleSection.find(this.selector.theme).text().trim()),
      title: emptyToUndefined(articleSection.find(this.selector.title).text().trim()),
      subtitle: emptyToUndefined(articleSection.find(this.selector.subtitle).text().trim()),
      publicationDate: articleSection.find(this.selector.publicationDate).attr('content') || undefined,
      articleContentHtml: articleSection.find(this.selector.articleContent).html() || undefined,
    };
  }

  private extractImageData($: CheerioAPI): string | undefined {
    const scriptContent = $(this.selector.image).html();
    if (!scriptContent) return undefined;

    const jsonObj = extractJsonObject(scriptContent, 'conteudoMateria');
    const relativeImageUrl: string | undefined = (jsonObj?.desktop?.imgPadrao) ?? jsonObj?.desktop?.img ?? undefined;
    return safeAbsoluteUrl(relativeImageUrl, this.baseUrl);
  }

  private extractAllData(
    articleSection: Cheerio<Element>,
    $: CheerioAPI
  ): RawArticleData {
    const imageUrl = this.extractImageData($);
    const author = this.extractAuthorData($);
    const basicData = this.extractBasicArticleData(articleSection);
    return { ...basicData, imageUrl, author };
  }

  private parseHtmlAndExtractData(
    html: string, 
    strategy: 'cheerio' | 'puppeteer'
): RawArticleData | null {
    const $: CheerioAPI = load(html);
    const articleSection: Cheerio<Element> = $(this.selector.articleSection);

    if (!articleSection.length) {
      log.warn(`Seção do artigo não encontrada com a estratégia ${strategy}`);
      return null;
    }

    const data = this.extractAllData(articleSection, $);
    log.debug(`Dados extraídos com ${strategy}:`, {
      title: data.title || 'N/A',
      hasContent: Boolean(data.articleContentHtml),
    });

    return data;
  }

  private async fetchHtmlWithCheerio(url: string): Promise<string> {
    log.debug(`Buscando HTML da URL (Cheerio): ${url}`);
    const { data } = await axios.get<string>(url, this.axiosConfig);
    return data;
  }

  private async fetchHtmlWithPuppeteer(url: string): Promise<string> {
    const browser = await this.initPuppeteer();
    let page: Page | null = null;

    try {
      page = await browser.newPage();
      log.debug(`Navegando (Puppeteer) → ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      try {
        await page.waitForSelector(this.selector.articleSection, { timeout: 10000 });
      } catch {
      }

      return await page.content();
    } finally {
      if (page) {
        try { await page.close(); } catch { /* noop */ }
      }
    }
  }
}

function extractJsonObject(scriptContent: string, varName: string): any | null {
  const regex = new RegExp(String.raw`var\s+${escapeRegex(varName)}\s*=\s*(\{[\s\S]*?\})\s*;?`);
  const match = scriptContent.match(regex);
  if (!match || !match[1]) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    try {
      const normalized = match[1].replace(/(['\"])\s*:\s*'/g, '" : "').replace(/'\s*,/g, '",');
      return JSON.parse(normalized);
    } catch {
      return null;
    }
  }
}

const log = {
  debug: (...args: any[]) => console.log('[scraper:debug]', ...args),
  warn: (...args: any[]) => console.warn('[scraper:warn]', ...args),
  error: (...args: any[]) => console.error('[scraper:error]', ...args),
};
