// Define the type for the configuration
export type Config = {
    environment: string;
    development: {
        BACKEND_API: string;
        GAMES_URL: string;
        SEARCH_GAMES_URL: string;
        SLOT_SPIN: string;
        SLOT_RESET: string;
        CURRENCY_API: string;
    };
    production: {
        apiUrl: string;
    };
};