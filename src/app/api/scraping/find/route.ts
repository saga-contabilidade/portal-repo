import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaNewsArticleRepository } from "@/modules/scraping/infrastructure/database/repositories/Prisma-newsArticle.repository";

export async function GET(req: Request) {
  try{
    const newsArticleRepository = new PrismaNewsArticleRepository(prisma);

    const { searchParams } = new URL(req.url);
    const limitQuery = searchParams.get('limit');

    const defaultLimit = 10;
    const limit = limitQuery ? parseInt(limitQuery, 10) : defaultLimit;
    const validLimit = isNaN(limit) || limit <= 0 ? defaultLimit : limit;

    console.log(`Buscando ${validLimit} artigos recentes...`);
    const articles = await newsArticleRepository.findRecentWithSourceDiversity(validLimit);

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar artigos' },
      { status: 500 }
    );
  }
}