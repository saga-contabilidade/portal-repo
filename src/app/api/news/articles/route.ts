import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { PrismaNewsArticleRepository } from '@/modules/scraping/infrastructure/database/repositories/Prisma-newsArticle.repository'

export async function GET() {
  try {
    const newsRepository = new PrismaNewsArticleRepository(prisma);
    const articles = await newsRepository.findRecentWithSourceDiversity(4);
    
    return NextResponse.json(articles);

  } catch (error) {
    console.error("Falha ao buscar notícias diversificadas:", error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar notícias.' },
      { status: 500 }
    );
  }
}