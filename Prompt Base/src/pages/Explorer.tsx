import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MediaGrid } from '../components/MediaCard';
import type { PromptItem } from '../api';

interface ExplorerPageProps {
    items: PromptItem[];
    seed: string;
    page: number;
    hasMore: boolean;
}

export const ExplorerPage: FC<ExplorerPageProps> = ({
    items,
    seed,
    page,
    hasMore
}) => {
    return (
        <Layout title="Explorer - Prompt Base">
            <Header currentPath="/explorer" />

            <main class="main">
                <section class="page-header page-header-explorer">
                    <div class="container">
                        <div class="page-header-content">
                            <h1 class="page-title">
                                <span class="page-icon">🎲</span>
                                Explorer
                            </h1>
                            <p class="page-subtitle">
                                Discover random prompts. Refresh for a new adventure!
                            </p>
                            <a href="/explorer" class="btn btn-secondary btn-small">
                                🔄 Shuffle Feed
                            </a>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <div class="container">
                        <div id="explorer-grid" data-seed={seed} data-page={page}>
                            <MediaGrid items={items} />
                        </div>

                        {hasMore && (
                            <div class="load-more-wrapper">
                                <button
                                    id="load-more-btn"
                                    class="btn btn-primary btn-large"
                                    data-seed={seed}
                                    data-next-page={page + 1}
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </Layout>
    );
};
