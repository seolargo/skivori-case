import axios from 'axios';

import config from '../config/config';	

const env = 'development';

// Base backend URL and endpoints
const backendUrl = config[env].BACKEND_API;
const gamesUrl = config[env].GAMES_URL;

/**
 * Fetch games from the backend.
 * @param {string} query - Search query for filtering games.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * 
 * @returns {Promise<Object>} The response data containing games and metadata.
 * 
 * @throws {Error} Throws an error if the request fails.
 */
export const fetchGamesFromRemote = async (
    query = '', 
    page = 1, 
    limit = 10
) => {
    try {
        const response = await axios.get(
            `${backendUrl}/${gamesUrl}`, 
            {
                params: {
                    search: query,
                    page,
                    limit,
                },
            }
        );

        return response.data;
    } catch (error) {
        throw new Error('Unable to fetch games. Please try again later.');
    }
};

export default fetchGamesFromRemote;