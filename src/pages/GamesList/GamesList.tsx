import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export const GameList = () => {
    const [allGames, setAllGames] = useState([]); // State for all games
    const [filteredGames, setFilteredGames] = useState([]); // State for filtered games
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState(''); // State to store search query
    const [notFound, setNotFound] = useState(false); // State for no results

    // Pagination states
    const [page, setPage] = useState(1); // Current page
    const [total, setTotal] = useState(0); // Total items
    const [limit] = useState(10); // Items per page (fixed for now)

    // Fetch games from the API
    const fetchGames = async (query = '', page = 1) => {
        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const response = await axios.get('http://localhost:3001/api/games', {
                params: {
                    search: query,
                    page,
                    limit,
                },
            });

            setAllGames(response.data.allGames); // Set all games
            setFilteredGames(response.data.paginatedGames); // Set paginated games
            setTotal(response.data.total); // Set total items

            // Handle "no results" for search
            if (query && response.data.paginatedGames.length === 0) {
                setNotFound(true);
            }
        } catch (err) {
            setError('An error occurred while fetching games. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch games on search input change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchGames(search.trim(), 1); // Reset to page 1 on new search
            setPage(1);
        }, 500); // Add a debounce for better performance

        return () => clearTimeout(delayDebounceFn); // Cleanup
    }, [search]);

    // Fetch games when the page changes
    useEffect(() => {
        fetchGames(search.trim(), page);
    }, [page]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
            setPage(newPage);
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
