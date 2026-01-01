import type { FC } from 'hono/jsx';
import type { PromptItem } from '../api';

interface MediaCardProps {
    item: PromptItem;
    showType?: boolean;
}

// SVG Icons for media types
const ImageIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
);

const VideoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
);

export const MediaCard: FC<MediaCardProps> = ({ item, showType = true }) => {
    const isVideo = item.type === 'video';
    const hasMultipleImages = item.imgUrls && item.imgUrls.length > 0;
    const showCarousel = item.imgUrls && item.imgUrls.length > 1;
    const allImages = showCarousel ? item.imgUrls! : [item.url];
    const cardId = `carousel-${item.id}`;

    return (
        <div class="media-card">
            <a href={`/item/${item.id}`} class="media-card-link-wrapper">
                <div class="media-card-image">
                    {showCarousel ? (
                        /* Carousel for multiple images */
                        <div class="media-carousel" id={cardId} data-current="0" data-total={allImages.length}>
                            <div class="carousel-track">
                                {allImages.map((imgUrl, idx) => (
                                    <img
                                        src={imgUrl}
                                        alt={`${item.title} - ${idx + 1}`}
                                        loading="lazy"
                                        class={`carousel-slide ${idx === 0 ? 'active' : ''}`}
                                        data-index={idx}
                                        onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2214%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22%3EImage unavailable%3C/text%3E%3C/svg%3E';"
                                    />
                                ))}
                            </div>
                            {/* Carousel navigation */}
                            <button
                                class="carousel-btn carousel-prev"
                                onclick={`event.preventDefault(); event.stopPropagation(); carouselPrev('${cardId}')`}
                                aria-label="Previous image"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                class="carousel-btn carousel-next"
                                onclick={`event.preventDefault(); event.stopPropagation(); carouselNext('${cardId}')`}
                                aria-label="Next image"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                            {/* Carousel dots */}
                            <div class="carousel-dots">
                                {allImages.map((_, idx) => (
                                    <span class={`carousel-dot ${idx === 0 ? 'active' : ''}`} data-index={idx}></span>
                                ))}
                            </div>
                        </div>
                    ) : isVideo ? (
                        <video
                            src={item.url}
                            poster={item.thumbnail}
                            muted
                            loop
                            preload="metadata"
                            onmouseenter="this.play()"
                            onmouseleave="this.pause(); this.currentTime = 0;"
                        />
                    ) : (
                        <img
                            src={item.url}
                            alt={item.title}
                            loading="lazy"
                            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2214%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22%3EImage unavailable%3C/text%3E%3C/svg%3E';"
                        />
                    )}

                    {showType && (
                        <span class={`media-type-badge ${item.type}`}>
                            {isVideo ? <VideoIcon /> : <ImageIcon />}
                            <span>{item.type}</span>
                        </span>
                    )}

                    <div class="media-card-overlay">
                        <button
                            class="like-btn"
                            data-id={item.id}
                            onclick="event.preventDefault(); event.stopPropagation(); toggleLike(this);"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span class="like-count">{item.likes}</span>
                        </button>
                    </div>
                </div>
            </a>

            <div class="media-card-content">
                <a href={`/item/${item.id}`} class="media-card-title-link">
                    <h3 class="media-card-title">{item.title}</h3>
                </a>

                {/* Uploader info */}
                {item.uploader && (
                    <div class="media-card-uploader">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        {item.uploaderUrl ? (
                            <a
                                href={item.uploaderUrl}
                                target="_blank"
                                rel="noopener"
                                class="uploader-link"
                                onclick="event.stopPropagation();"
                            >
                                {item.uploader}
                            </a>
                        ) : (
                            <span class="uploader-name">{item.uploader}</span>
                        )}
                    </div>
                )}

                <div class="media-card-tags">
                    {item.tags.slice(0, 3).map(tag => (
                        <span class="tag-chip-small">{tag}</span>
                    ))}
                    {item.tags.length > 3 && (
                        <span class="tag-more">+{item.tags.length - 3}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

interface MediaGridProps {
    items: PromptItem[];
    showType?: boolean;
}

export const MediaGrid: FC<MediaGridProps> = ({ items, showType = true }) => {
    return (
        <div class="media-grid">
            {items.map(item => (
                <MediaCard item={item} showType={showType} />
            ))}
        </div>
    );
};
