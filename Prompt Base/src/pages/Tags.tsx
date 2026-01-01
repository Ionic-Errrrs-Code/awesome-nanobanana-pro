import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TagChip } from '../components/TagChip';
import type { TagInfo } from '../api';

interface TagsPageProps {
    tags: TagInfo[];
    total: number;
}

export const TagsPage: FC<TagsPageProps> = ({ tags, total }) => {
    return (
        <Layout title="All Tags - Prompt Base">
            <Header currentPath="/tags" />

            <main class="main">
                <section class="page-header">
                    <div class="container">
                        <div class="page-header-content">
                            <h1 class="page-title">
                                <span class="page-icon">🏷️</span>
                                All Tags
                            </h1>
                            <p class="page-subtitle">
                                Browse all {total} tags to find exactly what you're looking for
                            </p>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <div class="container">
                        <div class="tags-grid">
                            {tags.map(tag => (
                                <a href={`/search?tag=${encodeURIComponent(tag.name)}`} class="tag-card">
                                    <span class="tag-card-name">{tag.name}</span>
                                    <span class="tag-card-count">{tag.count.toLocaleString()} prompts</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </Layout>
    );
};
