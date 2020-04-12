import { Document, model, Model, Schema } from "mongoose";
import * as Cache from "lru-cache";
import { Currency, ExchangeRate } from "../domain/currency";
import * as moment from "moment";
import { BulkWriteResult } from "mongodb";

const debug = require('debug')('datasource:rate');

const rateSchema = new Schema({
    date: { type: Date, required: true },
    from: { type: String, enum: Object.values(Currency) },
    to: { type: String, enum: Object.values(Currency) },
    rate: { type: Number, required: true }
});

export type CurrencyRateDocument = Document & {
    date: Date;
    from: Currency;
    to: Currency;
    rate: number;
}

export const MongoCurrencyRate: Model<CurrencyRateDocument, {}> = model<CurrencyRateDocument>('CurrencyRate', rateSchema);

const exchangeCache = new Cache<string, number>({
    max: Object.keys(Currency).length * 2,
    maxAge: 24 * 60 * 60
});

export async function upsertRates(rates: Array<ExchangeRate>): Promise<BulkWriteResult> {
    const { result } = await MongoCurrencyRate.bulkWrite(rates.map(r => ({
        updateOne: {
            filter: { date: r.date, from: r.from, to: r.to },
            update: { rate: r.rate },
            upsert: true
        }
    })));
    debug(result);
    return result;
}

export async function getExchangeRate(to: Currency, from: Currency = Currency.EUR): Promise<number> {
    if (from === to) { return 1; }

    const cached = exchangeCache.get(`${from}-${to}`)
    if (cached) { return cached; }

    const resolvedRates = await MongoCurrencyRate.find({
        from: from,
        to: to,
        date: { $gte: moment().subtract(1, 'day').startOf('day').toDate() }
    }).sort({ date: -1 }).limit(1);

    if (!resolvedRates.length) {
        throw Error('could not find exchange rate');
    }
    const { rate, date } = resolvedRates[0]
    const ttl = moment(date).diff(moment().endOf('day'), 'seconds');
    exchangeCache.set(`${from}-${to}`, rate, ttl);

    return rate;
}
