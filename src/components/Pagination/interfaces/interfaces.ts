export interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;

    onPageChange: (page: number) => void;
}