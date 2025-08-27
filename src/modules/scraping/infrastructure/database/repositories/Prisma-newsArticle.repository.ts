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
            SELECT * FROM "news_article"
            ORDER BY "publication_date" DESC
            LIMIT ${limit};
        `;
        
        const articlesFromDb = await this.prisma.$queryRaw<PrismaNewsArticleModel[]>(query);
        console.log(`Artigos encontrados com diversidade de fontes: ${articlesFromDb}`);
        return NewsArticleMapper.toDomainArray(articlesFromDb);   
    }
}