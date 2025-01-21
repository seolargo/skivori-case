import axios from 'axios';

// Base backend URL and endpoints
const backendUrl = process.env.BACKEND_API;
const gamesUrl = process.env.GAMES_URL;

/**
 * Fetch games from the backend.
 * @param {string} query - Search query for filtering games.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * @returns {Promise<Object>} The response data containing games and metadata.
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
        console.error('Error fetching games: ', error);

        throw new Error('Unable to fetch games. Please try again later.');
    }
};

export default fetchGamesFromRemote;