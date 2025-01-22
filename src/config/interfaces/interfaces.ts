// Define the type for the configuration
export type Config = {
    environment: string;
    development: {
        BACKEND_API: string;
        GAMES_URL: string;
        CURRENCY_API: string;
    };
    production: {
        apiUrl: string;
    };
};