import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MediaGrid } from '../components/MediaCard';
import { Pagination } from '../components/Pagination';
import type { PromptItem } from '../api';

interface GalleryPageProps {
    type: 'images' | 'videos';
    items: PromptItem[];
    page: number;
    totalPages: number;
    total: number;
}

export const GalleryPage: FC<GalleryPageProps> = ({
    type,
    items,
    page,
    totalPages,
    total
}) => {
    const isImages = type === 'images';
    const title = isImages ? 'Image Prompts' : 'Video Prompts';
    const icon = isImages ? '🖼️' : '🎬';

    return (
        <Layout title={`${title} - Prompt Base`}>
            <Header currentPath={`/${type}`} />

            <main class="main">
                <section class="page-header">
                    <div class="container">
                        <div class="page-header-content">
                            <h1 class="page-title">
                                <span class="page-icon">{icon}</span>
                                {title}
                            </h1>
                            <p class="page-subtitle">
                                {total.toLocaleString()} {isImages ? 'image' : 'video'} prompts available
                            </p>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <div class="container">
                        <MediaGrid items={items} showType={false} />

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl={`/${type}`}
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </Layout>
    );
};
