import { z } from 'zod';

export const NewsArticleSchema = z.object({
  title: z.string().min(5, 
    "O título é obrigatório e deve ter pelo menos 5 caracteres."
),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url(
    "A URL da imagem deve ser válida.").optional(),
  articleUrl: z.string().url(
    "A URL do artigo é obrigatória e deve ser válida."),
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  authorPhoto: z.string().url(
    "A URL da foto do autor deve ser válida.").optional(),
  publishedAt: z.coerce.date().optional(),
  source: z.string().min(3, 
    "A fonte da notícia é obrigatória."
),
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;
