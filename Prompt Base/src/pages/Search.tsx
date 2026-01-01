import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MediaGrid } from '../components/MediaCard';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import type { PromptItem } from '../api';

interface SearchPageProps {
    items: PromptItem[];
    query?: string;
    tag?: string;
    type?: string;
    page: number;
    totalPages: number;
    total: number;
}

export const SearchPage: FC<SearchPageProps> = ({
    items,
    query,
    tag,
    type,
    page,
    totalPages,
    total
}) => {
    const hasFilters = query || tag || type;

    return (
        <Layout title={`Search${query ? `: ${query}` : ''} - Prompt Base`}>
            <Header currentPath="/search" />

            <main class="main">
                <section class="page-header">
                    <div class="container">
                        <div class="page-header-content">
                            <h1 class="page-title">
                                <span class="page-icon">🔍</span>
                                Search Prompts
                            </h1>
                            <p class="page-subtitle">
                                Find the perfect prompt from our collection
                            </p>
                        </div>
                    </div>
                </section>

                <section class="search-section">
                    <div class="container">
                        <SearchBar query={query} tag={tag} type={type} />
                    </div>
                </section>

                <section class="section">
                    <div class="container">
                        {hasFilters && (
                            <div class="search-results-header">
                                <p class="results-count">
                                    {total.toLocaleString()} result{total !== 1 ? 's' : ''} found
                                    {query && <> for "<strong>{query}</strong>"</>}
                                    {tag && <> in tag "<strong>{tag}</strong>"</>}
                                    {type && <> of type "<strong>{type}</strong>"</>}
                                </p>
                                <a href="/search" class="clear-filters">Clear filters</a>
                            </div>
                        )}

                        {items.length > 0 ? (
                            <>
                                <MediaGrid items={items} />
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    baseUrl="/search"
                                    queryParams={{
                                        ...(query && { q: query }),
                                        ...(tag && { tag }),
                                        ...(type && { type })
                                    }}
                                />
                            </>
                        ) : hasFilters ? (
                            <div class="empty-state">
                                <span class="empty-icon">🔍</span>
                                <h2>No results found</h2>
                                <p>Try adjusting your search or filters</p>
                                <a href="/search" class="btn btn-primary">Clear filters</a>
                            </div>
                        ) : (
                            <div class="empty-state">
                                <span class="empty-icon">💡</span>
                                <h2>Start Searching</h2>
                                <p>Enter a search term or select filters above</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </Layout>
    );
};
