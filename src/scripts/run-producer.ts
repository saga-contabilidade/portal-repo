import { config } from '@/config';
import cron, { ScheduledTask } from 'node-cron'; 
import { Queue } from 'bullmq';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon'; 

const scrapingQueue = new Queue('scraping-queue', {
    connection: config.redis
});

const sources = [{
    url: 'https://www.contabeis.com.br/noticias/',
    source: 'Portal Contábeis',
    strategy: 'cheerio'
}];


async function addJobsToQueue() {
    console.log('⏰ Iniciando busca por novos artigos para enfileirar...');

    for (const site of sources) {
        try {
            const { data } = await axios.get(site.url);
            const $ = cheerio.load(data);
            let linksFound = 0;

            const linkElements = $('div.box-noticia a').get();

            for (const element of linkElements) {
                const relativeUrl = $(element).attr('href');

                if (relativeUrl) {
                    const fullUrl = new URL(relativeUrl, site.url).href;
                    
                    await scrapingQueue.add('scrape-article', {
                        url: fullUrl,
                        source: site.source,
                        strategy: site.strategy
                    }, {
                        jobId: fullUrl,
                        removeOnComplete: 1000,
                        removeOnFail: 5000
                    });

                    linksFound++;
                }
            }
            console.log(`🔎 Encontrados e adicionados ${linksFound} jobs para ${site.source}.`);

        } catch (error) { 
            console.error(`❌ Falha ao buscar links de ${site.source}:`, error);
        }
    }
}

const task: ScheduledTask = cron.schedule('0 9,15 * * 1-5', addJobsToQueue, {
    timezone: 'America/Sao_Paulo'
});

console.log('✅ Producer agendado.');

const nextExecution: DateTime = DateTime.fromJSDate(task.nextDates(1)[0]);

console.log(
    `➡️  A próxima execução automática está agendada para: ${nextExecution.toFormat('dd/MM/yyyy HH:mm:ss')}`
);

console.log('▶️  Executando o producer uma vez ao iniciar...');
addJobsToQueue();