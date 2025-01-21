import axios from 'axios';

const currencyUrl = process.env.CURRENCY_API;

/**
 * Fetches the exchange rate for the specified currency and converts the balance.
 * @param {string} currency - The target currency to convert to (e.g., 'EUR').
 * @param {number} balance - The amount to convert.
 * @returns {Promise<string>} - The converted balance with the currency symbol.
 * @throws {Error} - Throws an error if the currency is not found or the request fails.
 */
export const convertCurrency = async (currency, balance) => {
    try {
        // Fetch exchange rates from the API
        const response = await axios.get(`${currencyUrl}`);
        const rate = response.data.rates[currency];

        // Validate the rate
        if (!rate) {
            throw new Error(`Currency ${currency} not found.`);
        }

        // Perform the conversion
        const converted = (balance * rate).toFixed(2);
        return `${converted} ${currency}`;
    } catch (error) {
        // Handle errors and rethrow them for the caller to handle
        throw new Error(error.message || 'Failed to convert currency.');
    }
};
