/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

import React from 'react';

import { Directions } from '../../enums/enums';

import { PaginationProps } from './interfaces/interfaces';

// Items per page (fixed for now)
const limit = 10;

/**
 * Checks if the given page number is within valid bounds.
 * 
 * @param {number} newPage - The page number to validate.
 * @param {number} total - The total number of items.
 * @param {number} limit - The number of items per page.
 * 
 * @returns {boolean} - Returns true if the page number is valid, otherwise false.
 */
const isValidPage = (
    newPage: number,
    total: number,
    limit: number
) => {
    return newPage > 0 && newPage <= Math.ceil(total / limit);
};

/**
 * Renders the page number buttons for pagination.
 * 
 * @param {number} totalPages - The total number of pages.
 * @param {number} currentPage - The current page number.
 * @param {Function} onPageChange - Function to handle page changes.
 * 
 * @returns {JSX.Element[]} - An array of JSX elements representing the page buttons.
 */
const renderPageNumberButtons = (
    totalPages: number,
    currentPage: number,
    onPageChange: any
) => {
    return Array.from({ length: totalPages }, (_, index) => {
        const pageNum = index + 1;

        return (
            <li
                key={`page_${pageNum}`} // Add a unique key for each list item
                className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
            >
                <button
                    className="page-link"
                    onClick={() => onPageChange(pageNum)}
                >
                    {pageNum}
                </button>
            </li>
        );
    });
};

/**
 * Updates the current page state when the user navigates to a new page.
 * Ensures the new page is within valid bounds (greater than 0 and less than or equal to the total number of pages).
 * 
 * @param {number} newPage - The page number to navigate to.
 */
const handlePageChange = (newPage: number, total: number, onPageChange: any) => {
    if (isValidPage(newPage, total, limit)) {
        onPageChange(newPage);
    }
};

/**
 * Renders a pagination button.
 * 
 * @param {number} targetPage - The page number for the button.
 * @param {string} label - The button label.
 * @param {number} total - The total number of items.
 * @param {Function} onPageChange - The function to handle page navigation.
 * @param {boolean} isDisabled - Whether the button is disabled.
 * @param {boolean} isActive - Whether the button is active.
 * 
 * @returns {JSX.Element} - JSX for the pagination button.
 */
const renderPaginationButton = (
    targetPage: number,
    label: string,
    total: number,
    onPageChange: any,
    isDisabled = false,
    isActive = false
) => (
    <li
        key={`pagination_${label}_${targetPage}`} // Add a unique key for each button
        className={`page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`}
    >
        <button
            className="page-link"
            onClick={() => handlePageChange(targetPage, total, onPageChange)}
            disabled={isDisabled}
        >
            {label}
        </button>
    </li>
);

/**
 * Renders pagination controls.
 * 
 * @param {number} page - The current page number.
 * @param {number} total - The total number of items.
 * @param {number} limit - The number of items per page.
 * @param {Function} onPageChange - The function to handle page navigation.
 * 
 * @returns {JSX.Element} - JSX for the pagination controls.
 */
const renderPaginationControls = (
    page: number,
    total: number,
    limit: number,
    onPageChange: any
) => {
    const totalPages = Math.ceil(total / limit);

    return (
        <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
                {/* Previous Button */}
                {renderPaginationButton(
                    page - 1,
                    Directions.Previous,
                    total,
                    onPageChange,
                    page === 1
                )}

                {/* Page Number Buttons */}
                {renderPageNumberButtons(
                    totalPages,
                    page,
                    onPageChange
                )}

                {/* Next Button */}
                {renderPaginationButton(
                    page + 1,
                    Directions.Next,
                    total,
                    onPageChange,
                    page === totalPages
                )}
            </ul>
        </nav>
    );
};

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange
}) => {
    return renderPaginationControls(currentPage, totalItems, itemsPerPage, onPageChange);
};

export default Pagination;
