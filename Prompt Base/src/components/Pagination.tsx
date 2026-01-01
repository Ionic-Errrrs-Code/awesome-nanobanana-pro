import type { FC } from 'hono/jsx';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    queryParams?: Record<string, string>;
}

export const Pagination: FC<PaginationProps> = ({
    currentPage,
    totalPages,
    baseUrl,
    queryParams = {}
}) => {
    if (totalPages <= 1) return null;

    const buildUrl = (page: number) => {
        const params = new URLSearchParams({ ...queryParams, page: String(page) });
        return `${baseUrl}?${params}`;
    };

    // Build page numbers array - show more pages for ease of use
    const pages: (number | 'ellipsis')[] = [];

    // How many pages to show around current page
    const siblingsCount = 2; // Show 2 pages on each side
    const showFirstPages = 3; // Always show first 3 pages
    const showLastPages = 2; // Always show last 2 pages

    // Always show first few pages
    for (let i = 1; i <= Math.min(showFirstPages, totalPages); i++) {
        pages.push(i);
    }

    // Add ellipsis after first section if needed
    const leftStart = Math.max(showFirstPages + 1, currentPage - siblingsCount);
    if (leftStart > showFirstPages + 1) {
        pages.push('ellipsis');
    }

    // Show pages around current page
    for (let i = leftStart; i <= Math.min(totalPages - showLastPages, currentPage + siblingsCount); i++) {
        if (!pages.includes(i) && i > showFirstPages && i <= totalPages - showLastPages) {
            pages.push(i);
        }
    }

    // Add ellipsis before last section if needed
    const rightEnd = currentPage + siblingsCount;
    if (rightEnd < totalPages - showLastPages) {
        pages.push('ellipsis');
    }

    // Always show last few pages
    for (let i = Math.max(totalPages - showLastPages + 1, showFirstPages + 1); i <= totalPages; i++) {
        if (!pages.includes(i)) {
            pages.push(i);
        }
    }

    return (
        <nav class="pagination" aria-label="Pagination">
            {/* First page button */}
            {currentPage > 1 && (
                <a href={buildUrl(1)} class="pagination-btn first" title="First page">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="11 17 6 12 11 7" />
                        <polyline points="18 17 13 12 18 7" />
                    </svg>
                </a>
            )}

            {/* Previous page button */}
            {currentPage > 1 && (
                <a href={buildUrl(currentPage - 1)} class="pagination-btn prev">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span class="pagination-btn-text">Prev</span>
                </a>
            )}

            <div class="pagination-pages">
                {pages.map((page, i) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${i}`} class="pagination-ellipsis">•••</span>
                    ) : (
                        <a
                            key={page}
                            href={buildUrl(page)}
                            class={`pagination-page ${page === currentPage ? 'active' : ''}`}
                        >
                            {page}
                        </a>
                    )
                )}
            </div>

            {/* Next page button */}
            {currentPage < totalPages && (
                <a href={buildUrl(currentPage + 1)} class="pagination-btn next">
                    <span class="pagination-btn-text">Next</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </a>
            )}

            {/* Last page button */}
            {currentPage < totalPages && (
                <a href={buildUrl(totalPages)} class="pagination-btn last" title="Last page">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="13 17 18 12 13 7" />
                        <polyline points="6 17 11 12 6 7" />
                    </svg>
                </a>
            )}
        </nav>
    );
};
