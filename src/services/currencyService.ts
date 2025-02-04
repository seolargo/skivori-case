import axios from 'axios';
import config from '../config/config';
import { AxiosErrorWithCode, CurrencyCacheValue, ExchangeRatesResponse } from './interfaces/interfaces';

const env = config.environment || 'development';

/*
    Example of cached data:
    
    currencyCache.set('USD', { rate: 1.12, timestamp: 1693480800000 });
    currencyCache.set('EUR', { rate: 0.85, timestamp: 1693484400000 });
*/

/**
 * Fetches the exchange rate for the specified currency and converts the balance.
 * Implements caching, API failure handling, and security considerations for better performance and reliability.
 * @param {string} currency - The target currency to convert to (e.g., 'EUR').
 * @param {number} balance - The amount to convert.
 * @returns {Promise<string>} - The converted balance with the currency symbol.
 * @throws {Error} - Throws an error if the currency is not found or the request fails.
 */

// Simple in-memory cache
const currencyCache = new Map<string, CurrencyCacheValue>();

// 1 minutes
const CACHE_TTL = 1 * 60 * 1000; 

const currencyUrl = config[env as "development"].CURRENCY_API ?? '';

/**
 * Fetches the latest exchange rates from the API.
 * @returns {Promise<ExchangeRatesResponse>} - The exchange rates.
 * @throws {Error} - Throws an error if the API request fails.
 */
const fetchExchangeRates = async (): Promise<ExchangeRatesResponse> => {
    try {
        const response = await axios.get<ExchangeRatesResponse>(
            currencyUrl, 
            {
                // Set a timeout to prevent hanging requests
                timeout: 5000, 
            }
        );

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

/**
 * Converts a given balance to the specified currency using real-time exchange rates.
 * The function first checks the cache for a valid exchange rate. 
 * If not found or expired, it fetches the latest rates from an external API and caches them for future use.
 *
 * @async
 * @param {string} currency - The target currency code (e.g., "USD", "EUR").
 * @param {number} balance - The balance amount to be converted.
 * @returns {Promise<string>} A promise that resolves to the converted amount formatted as a string 
 *                            with the currency code (e.g., "123.45 USD").
 *
 * @throws {Error} Throws an error if the exchange rate for the specified currency is not found 
 *                 or if an error occurs during the conversion process.
 *
 * @example
 * // Convert 100 USD to EUR
 * convertCurrency("EUR", 100)
 *   .then(result => console.log(result)) // "85.00 EUR" (depending on the current rate)
 *   .catch(error => console.error(error));
 */
export const convertCurrency = async (currency: string, balance: number): Promise<string> => {
    try {
        const cacheKey = `${currency}`;
        const cachedRate = currencyCache.get(cacheKey);

        // Check if the currency rate is cached and still valid
        if (cachedRate && isCacheValid(cachedRate.timestamp, CACHE_TTL)) {
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
        currencyCache.set(
            cacheKey, 
            { 
                rate, 
                timestamp: Date.now() 
            }
        );

        // Perform the conversion
        const converted = (balance * rate).toFixed(2);
        return `${converted} ${currency}`;
    } catch (error) {
        console.error('Error occurred while converting currency');
        throw error;
    }
};

/**
 * Checks if the cached currency rate is still valid based on the cache TTL.
 *
 * @param {number} timestamp - The timestamp when the rate was cached.
 * @param {number} ttl - The time-to-live (TTL) for the cache in milliseconds.
 * @returns {boolean} Returns `true` if the cached rate is still valid, otherwise `false`.
 *
 * @example
 * isCacheValid(1629999999999, 3600000); // true if within the last hour
 */
const isCacheValid = (timestamp: number, ttl: number): boolean => {
    return Date.now() - timestamp < ttl;
};