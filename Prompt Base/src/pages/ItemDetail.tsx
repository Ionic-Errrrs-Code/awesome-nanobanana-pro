import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TagChip } from '../components/TagChip';
import type { PromptItem } from '../api';

interface ItemDetailPageProps {
    item: PromptItem;
}

export const ItemDetailPage: FC<ItemDetailPageProps> = ({ item }) => {
    const isVideo = item.type === 'video';
    // Get all images - use imgUrls if available, otherwise just the main url
    const allImages = item.imgUrls && item.imgUrls.length > 0 ? item.imgUrls : [item.url];
    const hasMultipleImages = allImages.length > 1;

    return (
        <Layout title={`${item.title} - Prompt Base`} description={item.description}>
            <Header />

            <main class="main">
                <section class="item-detail">
                    <div class="container">
                        <a href="#" onclick="history.back(); return false;" class="back-link-top">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Back
                        </a>
                        <div class="item-detail-grid">
                            {/* Media Preview */}
                            <div class="item-media">
                                {isVideo ? (
                                    <video
                                        src={item.url}
                                        poster={item.thumbnail}
                                        controls
                                        loop
                                        class="item-video"
                                    />
                                ) : hasMultipleImages ? (
                                    /* Image Gallery for multiple images */
                                    <div class="item-gallery">
                                        {allImages.map((imgUrl, index) => (
                                            <a href={imgUrl} target="_blank" rel="noopener" class="gallery-item">
                                                <img
                                                    src={imgUrl}
                                                    alt={`${item.title} - Image ${index + 1}`}
                                                    class="gallery-image"
                                                    loading="lazy"
                                                />
                                                <span class="gallery-index">{index + 1}/{allImages.length}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        class="item-image"
                                    />
                                )}
                            </div>

                            {/* Item Info */}
                            <div class="item-info">
                                <div class="item-type-badge-large">
                                    {isVideo ? '🎬 Video Prompt' : '🖼️ Image Prompt'}
                                </div>

                                <h1 class="item-title">{item.title}</h1>

                                {/* Source/Attribution Section */}
                                {(item.uploader || item.sourceUrl) && (
                                    <div class="item-attribution">
                                        {item.uploader && (
                                            <div class="attribution-row">
                                                <span class="attribution-label">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                        <circle cx="12" cy="7" r="4" />
                                                    </svg>
                                                    Shared by:
                                                </span>
                                                {item.uploaderUrl ? (
                                                    <a href={item.uploaderUrl} target="_blank" rel="noopener" class="attribution-link">
                                                        {item.uploader}
                                                    </a>
                                                ) : (
                                                    <span class="attribution-value">{item.uploader}</span>
                                                )}
                                            </div>
                                        )}
                                        {item.sourceUrl && (
                                            <div class="attribution-row">
                                                <span class="attribution-label">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                        <polyline points="15 3 21 3 21 9" />
                                                        <line x1="10" y1="14" x2="21" y2="3" />
                                                    </svg>
                                                    Source:
                                                </span>
                                                <a href={item.sourceUrl} target="_blank" rel="noopener" class="attribution-link">
                                                    View Original Post
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {item.description && (
                                    <div class="item-description">
                                        <h2>Description</h2>
                                        <p>{item.description}</p>
                                    </div>
                                )}

                                {item.promptData && (
                                    <div class="item-description">
                                        <h2>Prompt</h2>
                                        <div class="prompt-box">
                                            {(item.promptData.trim().startsWith('{') || item.promptData.trim().startsWith('[')) ? (
                                                <pre class="json-code">{item.promptData}</pre>
                                            ) : (
                                                <p>{item.promptData}</p>
                                            )}
                                            <button
                                                class="copy-btn"
                                                onclick={`navigator.clipboard.writeText(${JSON.stringify(item.promptData)});this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',2000);`}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div class="item-meta">
                                    <div class="item-likes">
                                        <button
                                            class="like-btn-large"
                                            data-id={item.id}
                                            onclick="toggleLike(this);"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                            <span class="like-count">{item.likes}</span> Likes
                                        </button>
                                    </div>
                                </div>

                                {item.tags.length > 0 && (
                                    <div class="item-tags">
                                        <h3>Tags</h3>
                                        <div class="tag-cloud">
                                            {item.tags.map(tag => (
                                                <TagChip name={tag} size="medium" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div class="item-actions">
                                    <a href={item.url} target="_blank" rel="noopener" class="btn btn-primary">
                                        Open Original
                                    </a>
                                    <button
                                        class="btn btn-secondary"
                                        onclick="history.back();"
                                    >
                                        ← Go Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </Layout>
    );
};
