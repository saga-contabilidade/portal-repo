import { NewsArticle } from '@/modules/scraping/domain/entities/newsArticle';


export interface INewsArticleRepository {
    upsert(article: NewsArticle): Promise<void>;

    findRecentWithSourceDiversity(limit: number,): Promise<NewsArticle[]>;
}