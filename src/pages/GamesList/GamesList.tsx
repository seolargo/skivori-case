// React and hooks
import React, { useEffect, useState } from 'react';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Services
import { fetchGamesFromRemote } from '../../services/gamesService';
import { convertCurrency } from '../../services/currencyService';

export const GameList = () => {
    // State for all games
    const [allGames, setAllGames] = useState([]); 

    // State for filtered games
    const [filteredGames, setFilteredGames] = useState([]); 

    // State to store search query
    const [search, setSearch] = useState<string>(''); 

    // State for no results found
    const [notFound, setNotFound] = useState<boolean>(false); 

    // Current balance in default currency
    const [balance, setBalance] = useState<number>(100); 

    // Converted balance
    const [convertedBalance, setConvertedBalance] = useState(null); 

    // Target currency
    const [currency, setCurrency] = useState('EUR'); 

    // Exchange rate error
    const [exchangeRateError, setExchangeRateError] = useState(null); 

    // Loading and error states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState(null);

    // Current page for pagination
    const [page, setPage] = useState<number>(1); 

    // Total items for pagination
    const [total, setTotal] = useState<number>(0); 

    // Items per page (fixed for now)
    const [limit] = useState<number>(10); 

    // Fetch games on search input change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Reset to page 1 on new search
            fetchGames(search.trim(), 1); 
            setPage(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // Fetch games when the page changes
    useEffect(() => {
        fetchGames(search.trim(), page);
    }, [page]);

    /**
     * Fetches games from the backend and updates the application state accordingly.
     * Handles loading, error, and not-found states during the fetch process.
     *
     * @async
     * @function
     * @param {string} [query=''] - The search query to filter games (default is an empty string for no filtering).
     * @param {number} [page=1] - The page number for pagination (default is 1).
     * @throws {Error} - Throws an error if the request fails or encounters an issue.
     */
    const fetchGames = async (query = '', page = 1) => {
        // Set values for loading, error, and not found states
        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            // Fetch games from the remote server
            fetchGamesFromRemote(query, page, limit)
                .then((response) => {
                    // Set all games
                    setAllGames(response.data.allGames); 

                    // Set paginated games
                    setFilteredGames(response.data.paginatedGames); 

                    // Set total items
                    setTotal(response.data.total); 

                    // Check if a search query exists and if no games match the query
                    handleNotFound(
                        query, 
                        response.data.paginatedGames, 
                        setNotFound
                    );
                })
                .catch((err) => {
                    setError('An error occurred while fetching games. Please try again.', err);
                });
        } catch (err) {
            setError('An error occurred while fetching games. Please try again.', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Determines whether the "not found" state should be set to true.
     * @param {string} query - The search query provided by the user.
     * @param {Array} paginatedGames - The list of games returned from the backend.
     * @returns {boolean} - Returns true if no games match the query; otherwise, false.
     */
    const shouldSetNotFound = (query, paginatedGames) => {
        return query && paginatedGames.length === 0;
    };

    /**
     * Updates the notFound state based on the search query and the result.
     * @param {string} query - The search query provided by the user.
     * @param {Array} paginatedGames - The list of games returned from the backend.
     * @param {Function} setNotFound - The state setter function for the notFound state.
     */
    const handleNotFound = (query, paginatedGames, setNotFound) => {
        setNotFound(shouldSetNotFound(query, paginatedGames));
    };

    /**
     * Updates the current page state when the user navigates to a new page.
     * Ensures the new page is within valid bounds (greater than 0 and less than or equal to the total number of pages).
     * @param {number} newPage - The page number to navigate to.
     */
    const handlePageChange = (newPage) => {
        // Check if the new page is valid (greater than 0 and within the total number of pages)
        if (isValidPage(newPage, total, limit)) {
            // Update the page state
            setPage(newPage); 
        }
    };

    /**
     * Checks if the given page number is within valid bounds.
     * @param {number} newPage - The page number to validate.
     * @param {number} total - The total number of items.
     * @param {number} limit - The number of items per page.
     * @returns {boolean} - Returns true if the page number is valid, otherwise false.
     */
    const isValidPage = (newPage, total, limit) => {
        return newPage > 0 && newPage <= Math.ceil(total / limit);
    };

    /**
     * Converts the user's balance to the selected currency.
     * Calls the currency conversion service and updates the converted balance state.
     * Handles any errors and sets an appropriate error message in the state.
     *
     * @async
     * @function
     * @throws {Error} - Throws an error if the currency conversion fails or the service is unavailable.
     */
    const convertBalance = async () => {
        setExchangeRateError(null);
        setConvertedBalance(null);

        try {
            // Call the service
            const converted = await convertCurrency(currency, balance); 

            // Update the converted balance
            setConvertedBalance(converted); 
        } catch (err) {
            setExchangeRateError('Failed to fetch exchange rate. Please try again.', err);
        }
    };

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">Game List</h1>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search games..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Display Current Balance */}
            <div className="mb-4">
                <h3>Current Balance: {balance} USD</h3>

                {/* Currency Conversion */}
                <div className="d-flex align-items-center">
                    <select
                        className="form-select me-2"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                        <option value="JPY">JPY</option>
                    </select>
                    <button className="btn btn-primary" onClick={convertBalance}>
                        Convert Balance
                    </button>
                </div>

                {/* Converted Balance */}
                {convertedBalance && (
                    <p className="mt-2">Converted Balance: {convertedBalance}</p>
                )}

                {/* Exchange Rate Error */}
                {exchangeRateError && (
                    <div className="alert alert-danger mt-2">{exchangeRateError}</div>
                )}
            </div>

            {/* Loading Message */}
            {loading && <div className="text-center my-3">Loading games...</div>}

            {/* Error Message */}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* Not Found Message */}
            {!loading && !error && notFound && (
                <div className="alert alert-warning text-center">
                    No games found for "<strong>{search}</strong>"
                </div>
            )}

            {/* Filtered Game List */}
            {!loading && !notFound && filteredGames.length > 0 && (
                <div className="row mb-5">
                    <h2>Filtered Results:</h2>
                    {filteredGames.map((game) => (
                        <div key={game.id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div className="card shadow-sm">
                                <img
                                    src={game?.thumb?.url}
                                    alt={game.name}
                                    className="card-img-top"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title text-center">{game.name}</h5>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && !notFound && (
                <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page - 1)}>
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((pageNum) => (
                            <li
                                key={pageNum}
                                className={`page-item ${page === pageNum ? 'active' : ''}`}
                            >
                                <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                    {pageNum}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${page === Math.ceil(total / limit) ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default GameList;
