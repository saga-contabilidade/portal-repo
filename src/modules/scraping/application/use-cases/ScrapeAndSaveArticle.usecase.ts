import { INewsArticleRepository } from '@/modules/scraping/domain/repositories/INewsArticleRepository';
import { INewsProvider } from '@/modules/scraping/infrastructure/providers/WebScraperProvider';
import { NewsArticleSchema } from '@/modules/scraping/domain/entities/newsArticle';

interface IInput {
    url: string;
    source: string;
    strategy: 'cheerio' | 'puppeteer';
}

export class ScrapeAndSaveArticleUseCase {
    constructor(
        private newsArticleRepository: INewsArticleRepository,
        private newsProvider: INewsProvider
    ) {}

    async execute({ url, source, strategy }: IInput): Promise<void> {
        const rowData = await this.newsProvider.fetchArticleData(url,strategy);
        if (!rowData){
            console.warn(`Nenhum dado extraido para a URL: ${url}`);
            return
        }

        const articleData = { ...rowData, source, articleUrl: url };

        const validationResult = NewsArticleSchema.safeParse(articleData);
        if (!validationResult.success) {
            console.error(`Erro de validação dos dados do artigo: ${JSON.stringify(validationResult.error)}`);
            return;
        }

        await this.newsArticleRepository.upsert(validationResult.data);
        console.log(`Artigo salvo com sucesso: ${validationResult.data.title}`);
    }
}