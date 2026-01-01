// Prompt Base - Client-side JavaScript

const API_BASE = '';

// Toggle like on an item
async function toggleLike(button) {
    const id = button.dataset.id;
    const countEl = button.querySelector('.like-count');
    const isLiked = button.classList.contains('liked');

    try {
        const method = isLiked ? 'DELETE' : 'POST';
        const res = await fetch(`${API_BASE}/api/like/${id}`, { method });
        const data = await res.json();

        if (data.likes !== undefined) {
            countEl.textContent = data.likes;
            button.classList.toggle('liked');

            // Add pulse animation
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

// Load more items for explorer
async function loadMoreExplorer() {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;

    const grid = document.getElementById('explorer-grid');
    const seed = btn.dataset.seed;
    const nextPage = parseInt(btn.dataset.nextPage);

    btn.disabled = true;
    btn.textContent = 'Loading...';

    try {
        const res = await fetch(`${API_BASE}/api/explorer?seed=${seed}&page=${nextPage}&limit=30`);
        const data = await res.json();

        // Create and append new cards
        const mediaGrid = grid.querySelector('.media-grid');

        data.data.forEach(item => {
            const card = createMediaCard(item);
            mediaGrid.appendChild(card);
        });

        // Update button state
        if (data.has_more) {
            btn.dataset.nextPage = nextPage + 1;
            btn.disabled = false;
            btn.textContent = 'Load More';
        } else {
            btn.parentElement.remove();
        }
    } catch (error) {
        console.error('Error loading more:', error);
        btn.disabled = false;
        btn.textContent = 'Try Again';
    }
}

// Create a media card element
function createMediaCard(item) {
    const isVideo = item.type === 'video';
    const card = document.createElement('a');
    card.href = `/item/${item.id}`;
    card.className = 'media-card';

    card.innerHTML = `
    <div class="media-card-image">
      ${isVideo ? `
        <video 
          src="${item.url}" 
          ${item.thumbnail ? `poster="${item.thumbnail}"` : ''}
          muted
          loop
          preload="metadata"
        ></video>
      ` : `
        <img 
          src="${item.url}" 
          alt="${escapeHtml(item.title)}"
          loading="lazy"
        />
      `}
      
      <span class="media-type-badge ${item.type}">
        ${isVideo ? '🎬' : '🖼️'} ${item.type}
      </span>
      
      <div class="media-card-overlay">
        <button 
          class="like-btn"
          data-id="${item.id}"
          onclick="event.preventDefault(); event.stopPropagation(); toggleLike(this);"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="like-count">${item.likes}</span>
        </button>
      </div>
    </div>
    
    <div class="media-card-content">
      <h3 class="media-card-title">${escapeHtml(item.title)}</h3>
      ${item.description ? `
        <p class="media-card-desc">${escapeHtml(item.description.slice(0, 120))}...</p>
      ` : ''}
      <div class="media-card-tags">
        ${item.tags.slice(0, 3).map(tag => `
          <span class="tag-chip-small">${escapeHtml(tag)}</span>
        `).join('')}
        ${item.tags.length > 3 ? `
          <span class="tag-more">+${item.tags.length - 3}</span>
        ` : ''}
      </div>
    </div>
  `;

    // Add video hover events
    if (isVideo) {
        const video = card.querySelector('video');
        card.addEventListener('mouseenter', () => video.play());
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    }

    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add load more click handler
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreExplorer);
    }

    // Add video hover handlers
    document.querySelectorAll('.media-card video').forEach(video => {
        const card = video.closest('.media-card');
        card.addEventListener('mouseenter', () => video.play());
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
});
