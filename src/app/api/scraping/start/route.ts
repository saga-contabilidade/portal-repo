import { NextResponse } from 'next/server';
import { addScrapingJobs } from '@/lib/scrapingProducer';

export async function POST() {
  console.log('API Endpoint /api/scraping/start foi chamado.');
  
  try {
    const jobsAdded = await addScrapingJobs();

    return NextResponse.json({ 
      message: 'Processo de scraping iniciado com sucesso.',
      jobsAdded: jobsAdded 
    });

  } catch (error) {
    console.error("Falha ao iniciar o processo de scraping via API:", error);
    return NextResponse.json(
      { error: 'Erro interno ao iniciar o scraping.' },
      { status: 500 }
    );
  }
}