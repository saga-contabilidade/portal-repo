import { config } from '@/config';
import { Queue } from 'bullmq';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function addScrapingJobs(): Promise<number> {
    const scrapingQueue = new Queue('scraping-queue', { connection: config.redis });
    const sources = [
        {
        url: 'https://www.contabeis.com.br/noticias',
        source: 'Portal Contábeis',
        strategy: 'cheerio'
        }
    ];
  
  let totalLinksFound = 0;

  console.log('▶️  Executando lógica para adicionar jobs...');

  for (const site of sources) {
      try {
          const { data } = await axios.get(site.url);
          const $ = cheerio.load(data);
          const linkElements = $('article > a').get();
          console.log(`[Depuração] Cheerio encontrou ${linkElements.length} elementos.`);
          for (const element of linkElements) {
              const relativeUrl = $(element).attr('href');
              if (relativeUrl) {
                  const fullUrl = new URL(relativeUrl, site.url).href;
                  await scrapingQueue.add('scrape-article', 
                    { url: fullUrl, source: site.source, strategy: site.strategy },
                    { jobId: fullUrl, removeOnComplete: 1000, removeOnFail: 5000 }
                  );
                  totalLinksFound++;
              }
          }
          console.log(`🔎 Encontrados ${totalLinksFound} jobs para ${site.source}.`);
      } catch (error) {
          console.error(`❌ Falha ao buscar links de ${site.source}:`, error);
      }
  }

  await scrapingQueue.close();

  return totalLinksFound;
}