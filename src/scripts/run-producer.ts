import cron from 'node-cron';
import { addScrapingJobs } from '@/lib/scrapingProducer';

console.log('⏰ Agendador de scraping iniciado.');

cron.schedule('0 9,15 * * 1-5', addScrapingJobs, {
    timezone: 'America/Sao_Paulo'
});

console.log('✅ Agendamento configurado.');