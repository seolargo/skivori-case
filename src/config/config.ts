import { Config } from "./interfaces/interfaces";

export const config: Config = {
    environment: "production", // development || production
    development: {
        //BACKEND_API: 'http://localhost:3001/api',
        BACKEND_API: 'http://localhost:8888/.netlify/functions',
        GAMES_URL: "games",
        SEARCH_GAMES_URL: "searchGames",
        SLOT_SPIN: "slot/spin",
        SLOT_RESET: "slot/reset",        
        CURRENCY_API: "https://open.er-api.com/v6/latest/USD"
    },
    production: {
        BACKEND_API: "https://lucky-mooncake-65a75f.netlify.app/.netlify/functions",
        GAMES_URL: "getAllGames",
        SEARCH_GAMES_URL: "searchGames",
        SLOT_SPIN: "spin",
        SLOT_RESET: "reset",
        CURRENCY_API: "https://open.er-api.com/v6/latest/USD"
    },
};

export default config;