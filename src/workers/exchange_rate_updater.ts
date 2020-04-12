import got from 'got';
import config from '../config';
import { Currency, ExchangeRate } from "../domain/currency";
import { upsertRates } from "../datasource/rate";

const debug = require('debug')('worker:exchange-rates');

const baseCurrency = Currency.EUR;
const supportedCurrencies = Object.values(Currency);

export async function retrieveRates(): Promise<Array<ExchangeRate>> {
    const { baseUrl, key } = config.get('fixer');
    const url = `${baseUrl}/latest?access_key=${key}&base=${baseCurrency.valueOf()}&symbols=${supportedCurrencies.join(',')}`
    try {
        const body: any = await got(url, {timeout: 2000, retry: 3}).json();
        return Object.entries(body.rates).map(([ symbol, rate ]) => {
            return new ExchangeRate(body.date, baseCurrency, Currency[symbol], rate as number);
        });
    } catch (e) {
        debug(e);
        const { response } = e;
        throw new Error(
            `Could not update exchange rates, received ${response.statusCode} and body ${response.body} for request to ${url}`
        )
    }
}

export default async function updateRates() {
    try {
        const rates = await retrieveRates();
        const writeResult: any = await upsertRates(rates);
        console.log(`Matched ${writeResult.nMatched} rates, updated ${writeResult.nUpserted} rates, inserted ${writeResult.nInserted} new records`);
    } catch (e) {
        console.error('Failed to update exchange rates with error', e);
    }
}