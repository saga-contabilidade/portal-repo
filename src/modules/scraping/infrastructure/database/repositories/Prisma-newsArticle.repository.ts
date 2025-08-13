import { PrismaClient, Prisma, NewsArticle as PrismaNewsArticleModel } from '@prisma/client';
import { INewsArticleRepository } from '@/modules/scraping/domain/repositories/INewsArticleRepository';
import { NewsArticle } from '@/modules/scraping/domain/entities/newsArticle';
import { NewsArticleMapper } from '@/modules/scraping/application/mappers/NewsArticleMapper';

export class PrismaNewsArticleRepository implements INewsArticleRepository{
    constructor(
        private prisma : PrismaClient
    ){}

    async upsert(article: NewsArticle): Promise<void> {
        await this.prisma.newsArticle.upsert({
            where: { articleUrl: article.articleUrl },
            update: article,
            create: article,
        });
    }

    async findRecentWithSourceDiversity(limit: number): Promise<NewsArticle[]> {
        const query = Prisma.sql`
            SELECT * FROM (
            SELECT *,
            ROW_NUMBER() OVER (PARTITION BY source ORDER BY publishedAt DESC) as rn
            FROM "NewsArticle"
            ) AS ranked_articles
             WHERE rn = 1
             ORDER BY 
             "publishedAt" DESC
              LIMIT ${limit};
              `;
        
        const articlesFromDb = await this.prisma.$queryRaw<PrismaNewsArticleModel[]>(query);

        return NewsArticleMapper.toDomainArray(articlesFromDb);
        
    }
}