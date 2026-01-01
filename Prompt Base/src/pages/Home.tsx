import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TagChip } from '../components/TagChip';
import type { TagInfo } from '../api';

interface HomePageProps {
    stats: {
        total_items: number;
        images: number;
        videos: number;
        tags: number;
    };
    featuredTags: TagInfo[];
}

export const HomePage: FC<HomePageProps> = ({ stats, featuredTags }) => {
    // SVG Icons
    const icons = {
        compass: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
        search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
        image: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
        video: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>,
        tag: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>
    };

    return (
        <Layout title="Prompt Base - AI Creative Prompts">
            <Header currentPath="/" />

            <main class="main">
                {/* Hero Section */}
                <section class="hero">
                    <div class="hero-bg"></div>
                    <div class="hero-content">
                        <h1 class="hero-title">
                            <span class="hero-title-line">Discover</span>
                            <span class="hero-title-gradient">AI Creative Prompts</span>
                        </h1>
                        <p class="hero-subtitle">
                            Browse {stats.total_items.toLocaleString()}+ curated prompts for images and videos.
                            Find inspiration for your next AI masterpiece.
                        </p>

                        <div class="hero-actions">
                            <a href="/explorer" class="btn btn-primary btn-large">
                                {icons.compass} Start Exploring
                            </a>
                            <a href="/search" class="btn btn-secondary btn-large">
                                {icons.search} Search Prompts
                            </a>
                        </div>

                        <div class="hero-stats">
                            <div class="stat-card">
                                <span class="stat-icon">{icons.image}</span>
                                <span class="stat-value">{stats.images.toLocaleString()}</span>
                                <span class="stat-label">Images</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-icon">{icons.video}</span>
                                <span class="stat-value">{stats.videos.toLocaleString()}</span>
                                <span class="stat-label">Videos</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-icon">{icons.tag}</span>
                                <span class="stat-value">{stats.tags}</span>
                                <span class="stat-label">Tags</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Access */}
                <section class="section">
                    <div class="container">
                        <h2 class="section-title">Quick Access</h2>
                        <div class="quick-cards">
                            <a href="/images" class="quick-card quick-card-images">
                                <img src="/images/images-illustration.png" alt="" class="quick-card-illustration" />
                                <h3>Image Prompts</h3>
                                <p>Browse {stats.images.toLocaleString()} image generation prompts</p>
                                <span class="quick-card-arrow">→</span>
                            </a>
                            <a href="/videos" class="quick-card quick-card-videos">
                                <img src="/images/videos-illustration.png" alt="" class="quick-card-illustration" />
                                <h3>Video Prompts</h3>
                                <p>Discover {stats.videos.toLocaleString()} video generation prompts</p>
                                <span class="quick-card-arrow">→</span>
                            </a>
                            <a href="/explorer" class="quick-card quick-card-explorer">
                                <img src="/images/explorer-illustration.png" alt="" class="quick-card-illustration" />
                                <h3>Random Explorer</h3>
                                <p>Infinite scroll through randomized prompts</p>
                                <span class="quick-card-arrow">→</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Featured Tags */}
                <section class="section section-dark">
                    <div class="container">
                        <div class="section-header">
                            <h2 class="section-title">Popular Tags</h2>
                            <a href="/tags" class="section-link">View all {stats.tags} tags →</a>
                        </div>
                        <div class="tag-cloud">
                            {featuredTags.slice(0, 20).map(tag => (
                                <TagChip name={tag.name} count={tag.count} size="large" />
                            ))}
                        </div>
                    </div>
                </section>

                {/* GitHub CTA */}
                <section class="section">
                    <div class="container">
                        <div class="github-cta">
                            <div class="github-cta-content">
                                <h2>Open Source</h2>
                                <p>This project is open source! Star us on GitHub and contribute.</p>
                            </div>
                            <a
                                href="https://github.com/Ionic-Errrrs-Code/awesome-nanobanana-pro-prompts"
                                target="_blank"
                                rel="noopener"
                                class="btn btn-github"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </Layout>
    );
};
