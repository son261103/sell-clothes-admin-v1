import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    // Pagination state
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;

    // Event handlers
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;

    // Customization options
    pageSizeOptions?: number[];
    labels?: {
        itemsPerPage?: string;
        itemsOf?: string;
        items?: string;
        next?: string;
        previous?: string;
        first?: string;
        last?: string;
    };
    className?: string;
    showFirstLast?: boolean;
    showPageSize?: boolean;
    showTotal?: boolean;
    compact?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   pageSize,
                                                   totalElements,
                                                   onPageChange,
                                                   onPageSizeChange,
                                                   pageSizeOptions = [10, 20, 50, 100],
                                                   labels = {
                                                       itemsPerPage: 'mục',
                                                       itemsOf: 'của',
                                                       items: 'mục',
                                                       next: 'Trang sau',
                                                       previous: 'Trang trước',
                                                       first: 'Trang đầu',
                                                       last: 'Trang cuối'
                                                   },
                                                   className = '',
                                                   showFirstLast = true,
                                                   showPageSize = true,
                                                   showTotal = true,
                                                   compact = false
                                               }) => {
    const getPageNumbers = () => {
        const delta = compact ? 1 : 2;
        const range: (number | string)[] = [];

        // Always include first page
        range.push(0);

        // Calculate range around current page
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i > 0 && i < totalPages - 1) {
                range.push(i);
            }
        }

        // Always include last page if not already included
        if (totalPages > 1) {
            range.push(totalPages - 1);
        }

        // Add dots where needed
        const rangeWithDots: (number | string)[] = [];
        let l: number | undefined;

        for (const i of range) {
            if (l) {
                if (typeof i === 'number' && typeof l === 'number') {
                    if (i - l === 2) {
                        rangeWithDots.push(l + 1);
                    } else if (i - l !== 1) {
                        rangeWithDots.push('...');
                    }
                }
            }
            rangeWithDots.push(i);
            l = typeof i === 'number' ? i : undefined;
        }

        return rangeWithDots;
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(e.target.value, 10);
        onPageSizeChange?.(newSize);
    };

    const startElement = currentPage * pageSize + 1;
    const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

    const PaginationButton = ({ onClick, disabled, children, title }: {
        onClick: () => void;
        disabled?: boolean;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm
        ${disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-textDark dark:text-textLight hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 bg-white dark:bg-secondary border-t border-gray-200 dark:border-gray-700 ${className}`}>
            {(showPageSize || showTotal) && (
                <div className="flex items-center gap-2 text-sm text-secondary dark:text-highlight">
                    {showPageSize && (
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textDark dark:text-textLight focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>
                                    {size} {labels.itemsPerPage}
                                </option>
                            ))}
                        </select>
                    )}
                    {showTotal && (
                        <span>
              {startElement}-{endElement} {labels.itemsOf} {totalElements} {labels.items}
            </span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-1">
                {showFirstLast && (
                    <PaginationButton
                        onClick={() => onPageChange(0)}
                        disabled={currentPage === 0}
                        title={labels.first}
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </PaginationButton>
                )}

                <PaginationButton
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    title={labels.previous}
                >
                    <ChevronLeft className="w-4 h-4" />
                </PaginationButton>

                {getPageNumbers().map((pageNumber, index) => (
                    pageNumber === '...' ? (
                        <span key={`dots-${index}`} className="px-2 text-gray-400 dark:text-gray-600">
              ...
            </span>
                    ) : (
                        <button
                            key={`page-${pageNumber}-${index}`}
                            onClick={() => onPageChange(pageNumber as number)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm
                ${currentPage === pageNumber
                                ? 'bg-primary text-white'
                                : 'text-textDark dark:text-textLight hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {(pageNumber as number) + 1}
                        </button>
                    )
                ))}

                <PaginationButton
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    title={labels.next}
                >
                    <ChevronRight className="w-4 h-4" />
                </PaginationButton>

                {showFirstLast && (
                    <PaginationButton
                        onClick={() => onPageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        title={labels.last}
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </PaginationButton>
                )}
            </div>
        </div>
    );
};

export default Pagination;