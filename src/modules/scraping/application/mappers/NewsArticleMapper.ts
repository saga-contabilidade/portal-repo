import { NewsArticle as DomainArticle, AuthorSchema } from '@/modules/scraping/domain/entities/newsArticle';
import { NewsArticle as PrismaArticle } from '@prisma/client';

export class NewsArticleMapper {

    public static toDomain(prismaArticle: PrismaArticle): DomainArticle {
       
        let authorData;
        if (prismaArticle.author) {
            const parseResult = AuthorSchema.safeParse(prismaArticle.author);
            if (parseResult.success) {
                authorData = parseResult.data;
            } else {
                console.warn(`Falha ao validar os dados do autor para o artigo com URL: ${prismaArticle.articleUrl}`, parseResult.error);
                authorData = undefined;
            }
        }
                
        return {
            theme: prismaArticle.theme ?? undefined,
            title: prismaArticle.title,
            subtitle: prismaArticle.subtitle ?? undefined,
            publicationDate: prismaArticle.publicationDate ?? undefined,
            articleContent: prismaArticle.articleContent,
            author: authorData,
            font: prismaArticle.font ?? undefined,
            source: prismaArticle.source,
            articleUrl: prismaArticle.articleUrl,
            imageUrl: prismaArticle.imageUrl ?? undefined,
        };
    }
    
    public static toDomainArray(prismaArticles: PrismaArticle[]): DomainArticle[] {
        return prismaArticles.map(this.toDomain);
    }
}