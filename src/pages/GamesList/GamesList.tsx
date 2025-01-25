// React and hooks
import React, { Profiler, Suspense } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Pagination from '../../components/Pagination/Pagination';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Services
import { fetchGamesFromRemote } from '../../services/gamesService';
import { convertCurrency } from '../../services/currencyService';
import { Currencies } from '../../enums/enums';
import sanitizeInput from '../../utils/sanitizeInput';
import { Game } from './interfaces/interface';
import devLog from '../../utils/devLog';

export const GameList = () => {
    // Current balance in default currency
    const balance = 100;

    const itemsPerPage = 10;
    
    // State for filtered games
    const [filteredGames, setFilteredGames] = useState<Game[]>([]); 

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
        devLog('useEffect triggered for search or page change');
    
        const delayDebounceFn = setTimeout(() => {
            fetchGames(search.trim(), page);
        }, 500);
    
        return () => clearTimeout(delayDebounceFn);
    }, [search, page]);

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
    const fetchGames = useCallback(async (query = '', page = 1) => {
        devLog('fetchGames function is called');

        // Sanitize the inputs
        const sanitizedInputs = sanitizeInput(
            { query, page }, 
            { query: '', page: 1 }
        );

        const { 
            query: sanitizedQuery, 
            page: sanitizedPage 
        } = sanitizedInputs;

        // Set values for loading, error, and not found states
        setLoading(true);
        setError("");
        setNotFound(false);

        try {
            // Fetch games from the remote server
            fetchGamesFromRemote(
                sanitizedQuery, 
                sanitizedPage, 
                limit
            )
                .then((response) => {
                    // Set paginated games
                    //setFilteredGames(response?.data?.paginatedGames);
                    setFilteredGames(response?.paginatedGames); 

                    // Set total items
                    // setTotal(response?.data?.total); 
                    setTotal(response?.total); 

                    // Check if a search query exists and if no games match the query
                    handleNotFound(
                        query, 
                        // response?.data?.paginatedGames, 
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
    }, [limit]);

    /**
     * Determines whether the "not found" state should be set to true.
     * 
     * @param {string} query - The search query provided by the user.
     * @param {Array} paginatedGames - The list of games returned from the backend.
     * 
     * @returns {boolean} - Returns true if no games match the query; otherwise, false.
     */
    const shouldSetNotFound = (query = "", paginatedGames = []) => {
        devLog('shouldSetNotFound function is called');

        const { 
            query: sanitizedQuery, 
            paginatedGames: sanitizedGames 
        } = sanitizeInput(
            { query, paginatedGames },
            { query: "", paginatedGames: [] }
        );

        return sanitizedQuery && sanitizedGames.length === 0;
    };

    /**
     * Updates the notFound state based on the search query and the result.
     * @param {string} query - The search query provided by the user.
     * @param {Array} paginatedGames - The list of games returned from the backend.
     * @param {Function} setNotFound - The state setter function for the notFound state.
     */
    const handleNotFound = (
        query = "", 
        paginatedGames = [], 
        setNotFound: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        devLog('handleNotFound function is called');

        const { 
            query: sanitizedQuery, 
            paginatedGames: sanitizedGames 
        } = sanitizeInput(
            { query, paginatedGames },
            { query: "", paginatedGames: [] }
        );

        setNotFound(
            Boolean(shouldSetNotFound(sanitizedQuery, sanitizedGames))
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
        devLog('convertBalance function is called');
        
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
    const RenderBalanceSection = React.memo((props: {
        balance?: number;
        currency?: string;
        setCurrency?: React.Dispatch<React.SetStateAction<Currencies>>;
        convertBalance?: () => void;
        convertedBalance?: string;
        exchangeRateError?: string;
    }) => {
        const {
            balance,
            currency,
            setCurrency,
            convertBalance,
            convertedBalance,
            exchangeRateError,
        } = sanitizeInput(
            props, {
                balance: 0,
                currency: Currencies.EUR,
                setCurrency: () => {
                    console.warn("Default setCurrency function invoked. Override this method.");
                },
                convertBalance: () => {
                    console.warn("Default convertBalance function invoked. Override this method.");
                },
                convertedBalance: "",
                exchangeRateError: "",
            }
        );

        devLog('renderBalanceSection function is called');

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
    const RenderFilteredGames = React.memo(({ filteredGames }: { filteredGames: Game[] }) => {
        const sanitizedGames = sanitizeInput(filteredGames, []);

        devLog('renderFilteredGames function is called');

        return (
            <div className="row mb-5">
                <h2>
                    Filtered Results:
                </h2>
                {sanitizedGames.map((game: Game) => (
                    <div 
                        key={game?.id} 
                        className="col-sm-6 col-md-4 col-lg-3 mb-4"
                    >
                        <div className="card shadow-sm">
                            <img
                                src={game?.thumb?.url}
                                alt={game?.title}
                                className="card-img-top"
                                loading="lazy"
                                width="300"
                                height="200"
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <h5 className="card-title text-center">
                                    {game?.title}
                                </h5>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    });    

    /**
     * Component to display a "No games found" message.
     * @param {Object} props - The component props.
     * @param {string} props.search - The search query provided by the user.
     * @returns {JSX.Element} - JSX for the "No games found" alert.
     */
    const NoGamesFound = React.memo(({ search } : { search: string }) => {
        devLog('NoGamesFound component is rendered');

        return (
            <div className="alert alert-warning text-center">
                No games found for <strong>{search}</strong>
            </div>
        )
    });

    /**
     * Component to display an error message.
     * 
     * @param {Object} props - The component props.
     * @param {string} props.error - The error message to display.
     * 
     * @returns {JSX.Element} - JSX for the error message.
     */
    const ErrorMessage = React.memo(({ error }: { error: Error | { message: string } | string }) => {
        devLog('ErrorMessage component is rendered');
    
        // Determine the message to display
        const errorMessage =
            typeof error === 'string' ? error : 'message' in error ? error.message : 'An unknown error occurred';
    
        return (
            <div className="alert alert-danger text-center">
                {errorMessage}
            </div>
        );
    });

    /**
     * Component to display a loading message.
     * @returns {JSX.Element} - JSX for the loading message.
     */
    const LoadingMessage = React.memo(() => {
        devLog('LoadingMessage component is rendered');

        return (
            <div className="text-center my-3">
                Loading games...
            </div>
        )
    });

    /**
     * Memoized balance section to render the user's balance, currency selector, and conversion button.
     * It prevents unnecessary re-renders unless `balance`, `currency`, `convertedBalance`, or `exchangeRateError` changes.
     *
     * @type {JSX.Element}
     */
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

    /**
     * Memoized component to render the filtered list of games.
     * It prevents re-renders unless `filteredGames` changes.
     *
     * @type {JSX.Element}
     */
    const memoizedFilteredGames = useMemo(() => (
        <Suspense fallback={<div>Loading games...</div>}>
            <RenderFilteredGames filteredGames={filteredGames} />
        </Suspense>
    ), [filteredGames]);

    /**
     * Memoized value to determine if the "No games found" message should be displayed.
     * It recalculates only when `loading`, `error`, or `notFound` changes.
     *
     * @type {boolean}
     */
    const showNotFound = useMemo(() => {
        devLog('showNotFound function is called');

        return !loading && !error && notFound;
    }, [loading, error, notFound]);
    
    /**
     * Memoized value to determine if the filtered game list should be displayed.
     * It recalculates only when `loading`, `notFound`, or `filteredGames` changes.
     *
     * @type {boolean}
     */
    const showFilteredGames = useMemo(() => {
        devLog('showFilteredGames function is called');
        
        return !loading && !notFound && filteredGames?.length > 0;
    }, [loading, notFound, filteredGames]);
    
    /**
     * Memoized value to determine if the main content should be displayed.
     * It recalculates only when `loading` or `notFound` changes.
     *
     * @type {boolean}
     */
    const displayContent = useMemo(() => {
        devLog('displayContent function is called');

        return !loading && !notFound;
    }, [loading, notFound]);

    /**
     * Memoized callback function to handle page changes in the pagination component.
     * It prevents re-creating the function unless `setPage` changes.
     *
     * @param {number} newPage - The new page number to set.
     */
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);

        // Reset page when search query changes
        setPage(1); 
    }, []);

    // Set the display names for the components
    NoGamesFound.displayName = 'NoGamesFound';
    LoadingMessage.displayName = 'LoadingMessage';
    ErrorMessage.displayName = 'ErrorMessage';
    RenderBalanceSection.displayName = 'RenderBalanceSection';
    RenderFilteredGames.displayName = 'RenderFilteredGames';

    return (
        <Profiler
            id="SlotMachine"
            onRender={(id, phase, actualDuration) => {
                console.log({ id, phase, actualDuration });
            }}
        >
            <div className="game-list container py-5">
                <h1 className="game-list__title text-center mb-4">
                    Game List
                </h1>

                {/* Balance Section */}
                {memoizedBalanceSection}

                {/* Search Bar */}
                <div className="game-list__search mb-4">
                    <input
                        key="search-input"
                        type="text"
                        className="form-control game-list__search-input"
                        placeholder="Search games..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="game-list__loading text-center my-3">
                        <LoadingMessage />
                    </div>
                )}

                {/* Error Message */}
                {error !== "" && (
                    <div className="game-list__error alert alert-danger text-center">
                        <ErrorMessage error={error} />
                    </div>
                )}

                {/* No Games Found */}
                {showNotFound && (
                    <div className="game-list__no-results alert alert-warning text-center">
                        <NoGamesFound search={search} />
                    </div>
                )}

                {/* Filtered Games */}
                {showFilteredGames && (
                    <div className="game-list__games row mb-5">
                        {memoizedFilteredGames}
                    </div>
                )}

                {/* Pagination */}
                {displayContent && (
                    <div className="game-list__pagination">
                        <Pagination
                            currentPage={page}
                            totalItems={total}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </Profiler>
    );
};

export default GameList;
