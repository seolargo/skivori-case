import { Config } from "./interfaces/interfaces";

export const config: Config = {
    environment: "development", // development || production
    development: {
        BACKEND_API: 'http://localhost:3001/api',
        GAMES_URL: "games",
        CURRENCY_API: "https://open.er-api.com/v6/latest/USD"
    },
    production: {
        apiUrl: 'https://api.production.com',
    },
};

export default config;