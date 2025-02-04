export interface AxiosErrorWithCode extends Error {
    code?: string;
    response?: {
        status?: number;
        data?: string;
    };
}

export interface ExchangeRatesResponse {
    rates: { [key: string]: number };
}

/**
 * Interface representing the structure of the currency cache value.
 */
export interface CurrencyCacheValue {
    rate: number;
    timestamp: number;
}