import { config } from '@/config'
import { Worker } from 'bullmq';

import { ScrapeAndSaveArticleUseCase } from '@/modules/scraping/application/use-cases/ScrapeAndSaveArticle.usecase';
import { WebScraperProvider } from '@/modules/scraping/infrastructure/providers/WebScraperProvider';
import { PrismaNewsArticleRepository } from '@/modules/scraping/infrastructure/database/repositories/Prisma-newsArticle.repository';
import { prisma } from '@/lib/prisma';

console.log('🔗 Conectando ao banco de dados...');  
console.log('✅ Configuração carregada para o ambiente:', config.env);

const newsRepository = new PrismaNewsArticleRepository(prisma);
const newsProvider = new WebScraperProvider();
const scrapeAndSaveArticleUseCase = new ScrapeAndSaveArticleUseCase(
    newsRepository,
    newsProvider    
);

console.log('🔗 Conectando ao Redis...');
const connection = config.redis;

console.log('🚀 Worker de scraping iniciado e pronto para processar jobs...');

const worker = new Worker('scraping-queue', async (job) => {
    const { url, source, strategy } = job.data;
    await scrapeAndSaveArticleUseCase.execute({ url, source, strategy });
}, { connection ,
     concurrency: 5,
});

worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} concluído.`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} falhou:`, err);
    if (err instanceof Error) {
        console.error(`   Mensagem: ${err.message}`);
        console.error(`   Stack: ${err.stack}`);
    }
});

const gracefulShutdown = async () => {
    console.log('🔌 Encerrando o worker de scraping...');
    await worker.close();
    console.log('✅ Worker encerrado com sucesso.');
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('exit', gracefulShutdown);

export default worker;