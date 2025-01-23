import axios from 'axios';
import config from '../config/config';

const env = 'development';

/**
 * Fetches the exchange rate for the specified currency and converts the balance.
 * Implements caching, API failure handling, and security considerations for better performance and reliability.
 * @param {string} currency - The target currency to convert to (e.g., 'EUR').
 * @param {number} balance - The amount to convert.
 * @returns {Promise<string>} - The converted balance with the currency symbol.
 * @throws {Error} - Throws an error if the currency is not found or the request fails.
 */

// Simple in-memory cache
const currencyCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface AxiosErrorWithCode extends Error {
    code?: string;
    response?: {
        status?: number;
        data?: string;
    };
}

interface ExchangeRatesResponse {
    rates: { [key: string]: number };
}

/**
 * Fetches the latest exchange rates from the API.
 * @returns {Promise<ExchangeRatesResponse>} - The exchange rates.
 * @throws {Error} - Throws an error if the API request fails.
 */
const fetchExchangeRates = async (): Promise<ExchangeRatesResponse> => {
    try {
        const response = await axios.get<ExchangeRatesResponse>(`${config[env].CURRENCY_API}`, {
            timeout: 5000, // Set a timeout to prevent hanging requests
        });

        // Validate API response
        if (!response.data || !response.data.rates) {
            throw new Error('Invalid API response: No rates found.');
        }

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosErrorWithCode;
        console.error('Error fetching exchange rates:', axiosError.message);

        if (axiosError.code === 'ECONNABORTED') {
            throw new Error('The request took too long - please try again later.');
        }

        if (axiosError.response?.status === 401) {
            throw new Error('Unauthorized access to the currency API. Please check your API key.');
        }

        if (axiosError.response?.status === 429) {
            throw new Error('Too many requests to the currency API - please try again later.');
        }

        throw new Error('Failed to fetch exchange rates. Please try again later.');
    }
};

export const convertCurrency = async (currency: string, balance: number): Promise<string> => {
    try {
        const cacheKey = `${currency}`;
        const cachedRate = currencyCache.get(cacheKey);

        // Check if the currency rate is cached and still valid
        if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_TTL) {
            console.log('Using cached exchange rate.');
            const converted = (balance * cachedRate.rate).toFixed(2);
            return `${converted} ${currency}`;
        }

        // Fetch exchange rates from the API
        const exchangeRates = await fetchExchangeRates();
        const rate = exchangeRates.rates[currency];

        // Validate the rate
        if (!rate) {
            throw new Error(`Currency ${currency} not found in the exchange rates.`);
        }

        // Cache the rate
        currencyCache.set(cacheKey, { rate, timestamp: Date.now() });

        // Perform the conversion
        const converted = (balance * rate).toFixed(2);
        return `${converted} ${currency}`;
    } catch (error) {
        console.error('Error occurred while converting currency');
        throw error; // Re-throw the error for the caller to handle
    }
};