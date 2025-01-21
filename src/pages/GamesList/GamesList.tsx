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
    const handleNotFound = (
        query, 
        paginatedGames, 
        setNotFound
    ) => {
        setNotFound(
            shouldSetNotFound(query, paginatedGames)
        );
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
    const isValidPage = (
        newPage, 
        total, 
        limit
    ) => {
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

    /**
     * Renders the search bar.
     * @param {string} search - The current search query.
     * @param {Function} setSearch - Function to update the search query.
     */
    const renderSearchBar = (search, setSearch) => (
        <div className="mb-4">
            <input
                type="text"
                className="form-control"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    );

    /**
     * Renders the current balance and currency conversion controls.
     * @param {number} balance - Current balance in USD.
     * @param {string} currency - Selected currency for conversion.
     * @param {Function} setCurrency - Function to update the selected currency.
     * @param {Function} convertBalance - Function to convert the balance.
     * @param {string|null} convertedBalance - Converted balance to display.
     * @param {string|null} exchangeRateError - Error message for exchange rate issues.
     */
    const renderBalanceSection = (
        balance, 
        currency, 
        setCurrency, 
        convertBalance, 
        convertedBalance, 
        exchangeRateError
    ) => (
        <div className="mb-4">
            <h3>
                Current Balance: {balance} USD
            </h3>
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
                <button 
                    className="btn btn-primary" 
                    onClick={convertBalance}
                >
                    Convert Balance
                </button>
            </div>
            {convertedBalance && 
                <p className="mt-2">
                    Converted Balance: {convertedBalance}
                </p>
            }
            {exchangeRateError && 
                <div className="alert alert-danger mt-2">
                    {exchangeRateError}
                </div>
            }
        </div>
    );

    /**
     * Renders the list of filtered games.
     * @param {Array} filteredGames - List of games matching the search query.
     */
    const renderFilteredGames = (filteredGames) => (
        <div className="row mb-5">
            <h2>
                Filtered Results:
            </h2>
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
                            <h5 className="card-title text-center">
                                {game.name}
                            </h5>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    /**
     * Renders a pagination button.
     * @param {number} targetPage - The page number for the button.
     * @param {string} label - The button label.
     * @param {boolean} isDisabled - Whether the button is disabled.
     * @param {boolean} isActive - Whether the button is active.
     * @returns {JSX.Element} - JSX for the pagination button.
     */
    const renderPaginationButton = (
        targetPage, 
        label, 
        isDisabled = false, 
        isActive = false
    ) => (
        <li className={`page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`}>
            <button 
                className="page-link" 
                onClick={() => handlePageChange(targetPage)} 
                disabled={isDisabled}
            >
                {label}
            </button>
        </li>
    );

    /**
     * Renders the page number buttons for pagination.
     * @param {number} totalPages - The total number of pages.
     * @param {number} currentPage - The current page number.
     * @param {Function} renderButton - Function to render individual pagination buttons.
     * @returns {JSX.Element[]} - An array of JSX elements representing the page buttons.
     */
    const renderPageNumberButtons = (
        totalPages, 
        currentPage, 
        renderButton
    ) => {
        // Use Array.from to create an array with a length equal to the total number of pages
        return Array.from(
            { length: totalPages }, 
            (_, index) => {
                // Add 1 to the index to determine the actual page number (pages start at 1, not 0)
                const pageNum = index + 1;

                // Call the renderButton function to generate a button for this page
                // The button is marked as active if the current page matches pageNum
                return renderButton(
                    pageNum, 
                    pageNum, 
                    false, 
                    currentPage === pageNum
                );
            }
        );
    };

    /**
     * Renders pagination controls.
     * @param {number} page - The current page number.
     * @param {number} total - The total number of items.
     * @param {number} limit - The number of items per page.
     * @param {Function} handlePageChange - The function to handle page navigation.
     * @returns {JSX.Element} - JSX for the pagination controls.
     */
    const renderPaginationControls = (page, total, limit) => {
        const totalPages = Math.ceil(total / limit);

        return (
            <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                    {/* Previous Button */}
                    {renderPaginationButton(
                        page - 1, 
                        'Previous', 
                        page === 1
                    )}

                    {/* Page Number Buttons */}
                    {renderPageNumberButtons(
                        totalPages, 
                        page, 
                        renderPaginationButton
                    )}

                    {/* Next Button */}
                    {renderPaginationButton(
                        page + 1, 
                        'Next', 
                        page === totalPages
                    )}
                </ul>
            </nav>
        );
    };

    /**
     * Determines if the "not found" message should be displayed.
     * @param {boolean} loading - Whether the application is currently loading.
     * @param {boolean} error - Whether an error occurred during the process.
     * @param {boolean} notFound - Whether no results were found for the query.
     * @returns {boolean} - Returns true if the "not found" message should be displayed.
     */
    const shouldShowNotFound = (
        loading, 
        error, 
        notFound
    ) => {
        return !loading && !error && notFound;
    };

    /**
     * Determines if the filtered game list should be displayed.
     * @param {boolean} loading - Whether the application is currently loading.
     * @param {boolean} notFound - Whether no results were found for the query.
     * @param {Array} filteredGames - The list of filtered games.
     * @returns {boolean} - Returns true if the filtered game list should be displayed.
     */
    const shouldShowFilteredGames = (
        loading, 
        notFound, 
        filteredGames
    ) => {
        return !loading && !notFound && filteredGames.length > 0;
    };

    /**
     * Determines if the component should display content when loading is complete, and no "not found" condition exists.
     * @param {boolean} loading - Whether the application is currently loading.
     * @param {boolean} notFound - Whether no results were found for the query.
     * @returns {boolean} - Returns true if content should be displayed.
     */
    const shouldDisplayContent = (
        loading, 
        notFound
    ) => {
        return !loading && !notFound;
    };

    /**
     * Component to display a "No games found" message.
     * @param {Object} props - The component props.
     * @param {string} props.search - The search query provided by the user.
     * @returns {JSX.Element} - JSX for the "No games found" alert.
     */
    const NoGamesFound = ({ search }) => (
        <div className="alert alert-warning text-center">
            No games found for "<strong>{search}</strong>"
        </div>
    );

    /**
     * Component to display an error message.
     * @param {Object} props - The component props.
     * @param {string} props.error - The error message to display.
     * @returns {JSX.Element} - JSX for the error message.
     */
    const ErrorMessage = ({ error }) => (
        <div className="alert alert-danger text-center">
            {error}
        </div>
    );

    /**
     * Component to display a loading message.
     * @returns {JSX.Element} - JSX for the loading message.
     */
    const LoadingMessage = () => (
        <div className="text-center my-3">
            Loading games...
        </div>
    );

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">Game List</h1>

            {renderSearchBar(search, setSearch)}

            {renderBalanceSection(
                balance,
                currency,
                setCurrency,
                convertBalance,
                convertedBalance,
                exchangeRateError
            )}

            {loading && 
                <LoadingMessage />
            }

            {error && 
                <ErrorMessage error={error} />
            }

            {shouldShowNotFound(loading, error, notFound) && (
                <NoGamesFound search={search} />
            )}

            {shouldShowFilteredGames(loading, notFound, filteredGames) && 
                renderFilteredGames(filteredGames)
            }

            {shouldDisplayContent(loading, notFound) && 
                renderPaginationControls(page, total, limit)
            }
        </div>
    );
};

export default GameList;
