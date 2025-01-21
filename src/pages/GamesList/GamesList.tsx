/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// React and hooks
import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Pagination from '../../components/Pagination/Pagination';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Services
import { fetchGamesFromRemote } from '../../services/gamesService';
import { convertCurrency } from '../../services/currencyService';
import { Currencies } from '../../enums/enums';

export const GameList = () => {
    // Current balance in default currency
    const balance = 100;

    const itemsPerPage = 10;
    
    // State for filtered games
    const [filteredGames, setFilteredGames] = useState([]); 

    // State to store search query
    const [search, setSearch] = useState<string>(''); 

    // State for no results found
    const [notFound, setNotFound] = useState<boolean>(false); 

    // Converted balance
    const [convertedBalance, setConvertedBalance] = useState<string>(""); 

    // Target currency
    const [currency, setCurrency] = useState<Currencies>(Currencies.EUR); 

    // Exchange rate error
    const [exchangeRateError, setExchangeRateError] = useState<string>(""); 

    // Loading and error states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Current page for pagination
    const [page, setPage] = useState<number>(1); 

    // Total items for pagination
    const [total, setTotal] = useState<number>(0); 

    // Items per page (fixed for now)
    const [limit] = useState<number>(10); 

    // Fetch games on search input change
    useEffect(() => {
        console.log('useEffect triggered for search input');

        const delayDebounceFn = setTimeout(() => {
            // Reset to page 1 on new search
            fetchGames(search.trim(), 1); 
            setPage(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // Fetch games when the page changes
    useEffect(() => {
        console.log('useEffect triggered for page change');

        fetchGames(search.trim(), page);
    }, [page]);

    /**
     * Fetches games from the backend and updates the application state accordingly.
     * Handles loading, error, and not-found states during the fetch process.
     *
     * @async
     * @function
     * 
     * @param {string} [query=''] - The search query to filter games (default is an empty string for no filtering).
     * @param {number} [page=1] - The page number for pagination (default is 1).
     * 
     * @throws {Error} - Throws an error if the request fails or encounters an issue.
     */
    const fetchGames = async (query = '', page = 1) => {
        console.log('fetchGames function is called');

        // Set values for loading, error, and not found states
        setLoading(true);
        setError("");
        setNotFound(false);

        try {
            // Fetch games from the remote server
            fetchGamesFromRemote(query, page, limit)
                .then((response) => {
                    // Set paginated games
                    setFilteredGames(response?.paginatedGames); 

                    // Set total items
                    setTotal(response?.total); 

                    // Check if a search query exists and if no games match the query
                    handleNotFound(
                        query, 
                        response?.paginatedGames, 
                        setNotFound
                    );
                })
                .catch((err) => {
                    setError(err);
                });
        } catch (err) {
            setError('An error occurred while fetching games. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Determines whether the "not found" state should be set to true.
     * 
     * @param {string} query - The search query provided by the user.
     * @param {Array} paginatedGames - The list of games returned from the backend.
     * 
     * @returns {boolean} - Returns true if no games match the query; otherwise, false.
     */
    const shouldSetNotFound = (query: string, paginatedGames = []) => {
        console.log('shouldSetNotFound function is called');

        return query && paginatedGames.length === 0;
    };

    /**
     * Updates the notFound state based on the search query and the result.
     * @param {string} query - The search query provided by the user.
     * @param {Array} paginatedGames - The list of games returned from the backend.
     * @param {Function} setNotFound - The state setter function for the notFound state.
     */
    const handleNotFound = (
        query: string, 
        paginatedGames = [], 
        setNotFound: any
    ) => {
        console.log('handleNotFound function is called');

        setNotFound(
            shouldSetNotFound(query, paginatedGames)
        );
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
        console.log('convertBalance function is called');
        
        setExchangeRateError("");
        setConvertedBalance("");

        try {
            // Call the service
            const converted = await convertCurrency(currency, balance); 

            // Update the converted balance
            setConvertedBalance(converted); 
        } catch (err) {
            setExchangeRateError('Failed to fetch exchange rate. Please try again.');
        }
    };

    /**
     * Renders the current balance and currency conversion controls.
     * 
     * @param {number} balance - Current balance in USD.
     * @param {string} currency - Selected currency for conversion.
     * @param {Function} setCurrency - Function to update the selected currency.
     * @param {Function} convertBalance - Function to convert the balance.
     * @param {string} convertedBalance - Converted balance to display.
     * @param {string} exchangeRateError - Error message for exchange rate issues.
     */
    const RenderBalanceSection = React.memo(({
        balance, 
        currency, 
        setCurrency,
        convertBalance, 
        convertedBalance, 
        exchangeRateError
    }: {
        balance: number, 
        currency: string,
        setCurrency: any;
        convertBalance: () => void, 
        convertedBalance: string, 
        exchangeRateError: string
    }) => {
        console.log('renderBalanceSection function is called');

        return (
            <div className="mb-4">
                <h3>
                    Current Balance: {balance} {Currencies.USD}
                </h3>
                <div className="d-flex align-items-center">
                    <select
                        className="form-select me-2"
                        value={currency}
                        onChange={setCurrency}
                    >
                        <option value={Currencies.EUR}>{Currencies.EUR}</option>
                        <option value={Currencies.GBP}>{Currencies.GBP}</option>
                        <option value={Currencies.INR}>{Currencies.INR}</option>
                        <option value={Currencies.JPY}>{Currencies.JPY}</option>
                    </select>
                    <button 
                        className="btn btn-primary w-25" 
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
        )
    });

    /**
     * Renders the list of filtered games.
     * @param {Array} filteredGames - List of games matching the search query.
     */
    const RenderFilteredGames = React.memo(({ filteredGames }: { filteredGames: Array<any> }) => {
        console.log('renderFilteredGames function is called');

        if (!Array.isArray(filteredGames)) {
            return <div>No games available.</div>;
        }

        return (
            <div className="row mb-5">
                <h2>
                    Filtered Results:
                </h2>
                {filteredGames.map((game) => (
                    <div 
                        key={game?.id} 
                        className="col-sm-6 col-md-4 col-lg-3 mb-4"
                    >
                        <div className="card shadow-sm">
                            <img
                                src={game?.thumb?.url}
                                alt={game?.name}
                                className="card-img-top"
                            />
                            <div className="card-body">
                                <h5 className="card-title text-center">
                                    {game?.name}
                                </h5>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    });    

    /**
     * Determines if the "not found" message should be displayed.
     * 
     * @param {boolean} loading - Whether the application is currently loading.
     * @param {string} error - Whether an error occurred during the process.
     * @param {boolean} notFound - Whether no results were found for the query.
     * 
     * @returns {boolean} - Returns true if the "not found" message should be displayed.
     */
    const shouldShowNotFound = (
        loading: boolean, 
        error: string, 
        notFound: boolean
    ) => {
        console.log('shouldShowNotFound function is called');

        return !loading && !error && notFound;
    };

    /**
     * Determines if the filtered game list should be displayed.
     * 
     * @param {boolean} loading - Whether the application is currently loading.
     * @param {boolean} notFound - Whether no results were found for the query.
     * @param {Array} filteredGames - The list of filtered games.
     * 
     * @returns {boolean} - Returns true if the filtered game list should be displayed.
     */
    const shouldShowFilteredGames = (
        loading: boolean, 
        notFound: boolean, 
        filteredGames = []
    ) => {
        console.log('shouldShowFilteredGames function is called');
        
        return !loading && !notFound && filteredGames.length > 0;
    };

    /**
     * Determines if the component should display content when loading is complete, and no "not found" condition exists.
     * 
     * @param {boolean} loading - Whether the application is currently loading.
     * @param {boolean} notFound - Whether no results were found for the query.
     * 
     * @returns {boolean} - Returns true if content should be displayed.
     */
    const shouldDisplayContent = (loading: boolean, notFound: boolean) => {
        console.log('shouldDisplayContent function is called');

        return !loading && !notFound;
    };

    /**
     * Component to display a "No games found" message.
     * @param {Object} props - The component props.
     * @param {string} props.search - The search query provided by the user.
     * @returns {JSX.Element} - JSX for the "No games found" alert.
     */
    const NoGamesFound = React.memo(({ search } : { search: string }) => {
        console.log('NoGamesFound component is rendered');

        return (
            <div className="alert alert-warning text-center">
                No games found for <strong>{search}</strong>
            </div>
        )
    });

    /**
     * Component to display an error message.
     * @param {Object} props - The component props.
     * @param {string} props.error - The error message to display.
     * @returns {JSX.Element} - JSX for the error message.
     */
    const ErrorMessage = React.memo(({ error } : { error: any }) => {
        console.log('ErrorMessage component is rendered');

        return (
            <div className="alert alert-danger text-center">
                {error.message}
            </div>
        )
    });

    /**
     * Component to display a loading message.
     * @returns {JSX.Element} - JSX for the loading message.
     */
    const LoadingMessage = React.memo(() => {
        console.log('LoadingMessage component is rendered');

        return (
            <div className="text-center my-3">
                Loading games...
            </div>
        )
    });

    const memoizedBalanceSection = useMemo(() => (
        <RenderBalanceSection
            balance={balance}
            currency={currency}
            setCurrency={setCurrency}
            convertBalance={convertBalance}
            convertedBalance={convertedBalance}
            exchangeRateError={exchangeRateError}
        />
    ), [balance, currency, convertedBalance, exchangeRateError]);

    const memoizedFilteredGames = useMemo(() => (
        <RenderFilteredGames filteredGames={filteredGames} />
    ), [filteredGames]);

    const showNotFound = useMemo(() => shouldShowNotFound(loading, error, notFound), [loading, error, notFound]);
    const showFilteredGames = useMemo(() => shouldShowFilteredGames(loading, notFound, filteredGames), [loading, notFound, filteredGames]);
    const displayContent = useMemo(() => shouldDisplayContent(loading, notFound), [loading, notFound]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    // Set the display names for the components
    NoGamesFound.displayName = 'NoGamesFound';
    LoadingMessage.displayName = 'LoadingMessage';
    ErrorMessage.displayName = 'ErrorMessage';
    RenderBalanceSection.displayName = 'RenderBalanceSection';
    RenderFilteredGames.displayName = 'RenderFilteredGames';

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">
                Game List
            </h1>

            {memoizedBalanceSection}

            {/* Search input */}
            <div className="mb-4">
                <input
                    key="search-input"
                    type="text"
                    className="form-control"
                    placeholder="Search games..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading && 
                <LoadingMessage />
            }

            {error !== "" && 
                <ErrorMessage error={error} />
            }

            {showNotFound && (
                <NoGamesFound search={search} />
            )}

            {showFilteredGames && 
                memoizedFilteredGames
            }

            {displayContent && 
                <Pagination
                    currentPage={page}
                    totalItems={total}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            }
        </div>
    );
};

export default GameList;
