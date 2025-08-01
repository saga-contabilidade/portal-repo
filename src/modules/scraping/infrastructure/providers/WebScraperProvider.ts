import { NewsArticle } from '@/modules/scraping/domain/entities/newsArticle';
import { axios } from 'axios';
import * as cheerio from 'cheerio';
import pupperteer from 'puppeteer';

export interface INewsProvider {
    fetchArticleData(
        url: string,
        strategy: 'cheerio' | 'puppeteer'
    ): Promise<Partial<NewsArticle> | null>;
}

export class WebScraperProvider implements INewsProvider {
    public async fetchArticleData(
        url: string,
        strategy: 'cheerio' | 'puppeteer'
        ): Promise<Partial<NewsArticle> | null> {
        try {
            if (strategy === 'puppeteer'){
                return await this.scrapeWithPuppeteer(url);
            } else {
                return await this.scrapeWithCheerio(url);
            }
        } catch (error) {
            console.error(
                `Falha ao fazer scraping da URL ${url} com a estratégia ${strategy}:`, error);
            return null;
        }
    }

    private async scrapeWithCheerio(url: string): Promise<Partial<NewsArticle> | null> {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        const headline = $('h1').first().text().trim();

            }