import { z } from 'zod';

export const AuthorSchema = z.object({
  name: z.string(),
  photo: z.url().optional(),
  moreArticlesLink: z.url().optional()
});

export type Author = z.infer<typeof AuthorSchema>;

export const NewsArticleSchema = z.object({
  theme: z.string().optional(),
  title: z.string().min(5, 
    "O título é obrigatório e deve ter pelo menos 5 caracteres."
  ),
  subtitle: z.string().optional(),
  publicationDate: z.coerce.date().optional(),
  articleContent: z.string().min(10, 
    "O conteúdo do artigo é obrigatório e deve ter pelo menos 10 caracteres."
  ),
  author: AuthorSchema.optional(),
  font:z.string().optional(),
  source: z.string().min(1, "A fonte é obrigatória."),
  articleUrl: z.url("A URL do artigo deve ser uma URL válida.")
});


export type NewsArticle = z.infer<typeof NewsArticleSchema>;
