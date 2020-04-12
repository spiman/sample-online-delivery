import { ValidationError } from './error';

export enum Currency {
    EUR = 'EUR',
    USD = 'USD',
    GBP = 'GBP',
    CHF = 'CHF'
}

export namespace Currency {
    export function parse(currency: string): Currency {
        const parsed = (currency as Currency);
        if (!Object.values(Currency).includes(parsed)) {
            throw new ValidationError(`Could not cast ${parsed} to a valid currency code`);
        }
        return parsed;
    }
}

export class ExchangeRate {
    date: Date;
    from: Currency;
    to: Currency;
    rate: number;

    constructor(date: Date, from: Currency, to: Currency, rate: number) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.rate = rate;
    }
}