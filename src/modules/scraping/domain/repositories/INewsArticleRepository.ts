import { NewsArticle as NewsArticleEntity } from '@/modules/scraping/domain/entities/newsArticle';
import { NewsArticle as PrismaNewsArticle } from '@prisma/client';

export interface INewsArticleRepository {
    upsert(article: NewsArticleEntity): Promise<void>;

    findRecentWithSourceDiversity(
        limit: number,): Promise<PrismaNewsArticle[]>;
    }