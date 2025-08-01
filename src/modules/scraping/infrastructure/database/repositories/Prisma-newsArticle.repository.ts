import { INewsArticleRepository } from "@/modules/scraping/domain/repositories/INewsArticleRepository";
import { ar } from "zod/locales";

export class PrismaNewsArticleRepository implements INewsArticleRepository{
    constructor(
        private prisma : PrismaClient
    ){}

    async upsert(article: NewsArticleEntity): Promise<void> {
        await this.prisma.NewsArticle.upsert({
            where: { articleUrl: article.articleUrl },
            update: article,
            create: article,
        });
    }

    async findRecentWithSourceDiversity(limit: number): Promise<PrismaNewsArticle[]> {
        const query = `
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
        
        const articles = await this.prisma.$queryRawUnsafe<PrismaNewsArticle[]>(query);

        return articles;
    }
}