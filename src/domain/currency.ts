import { ValidationError } from "./error";

export enum Currency {
    EUR = "EUR",
    USD = "USD",
    GBP = "GBP",
    CHF = "CHF"
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