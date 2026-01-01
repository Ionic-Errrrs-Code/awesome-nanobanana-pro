import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
// @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST';
import {
  fetchImages,
  fetchVideos,
  fetchExplorer,
  fetchTags,
  search,
  getItem,
  likeItem,
  unlikeItem,
  type TagsResponse,
  type ExplorerResponse,
  type PaginatedResponse,
  type PromptItem
} from './api';

import { HomePage } from './pages/Home';
import { GalleryPage } from './pages/Gallery';
import { ExplorerPage } from './pages/Explorer';
import { TagsPage } from './pages/Tags';
import { ItemDetailPage } from './pages/ItemDetail';
import { SearchPage } from './pages/Search';

// Type for Cloudflare environment bindings
type Bindings = {
  __STATIC_CONTENT: KVNamespace;
  __STATIC_CONTENT_MANIFEST: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Serve static files is handled automatically by Cloudflare Workers in production
// In local dev, wrangler serves ./public folder content

// Inline CSS for reliable serving
const inlineCSS = `
/* =========================================
   Prompt Base - Comprehensive Styles
   ========================================= */

:root {
  --bg-primary: #0a0a12;
  --bg-secondary: #0f0f1a;
  --bg-tertiary: #161625;
  --bg-card: #1a1a2e;
  --bg-glass: rgba(255, 255, 255, 0.04);
  --bg-glass-hover: rgba(255, 255, 255, 0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.75);
  --text-muted: rgba(255, 255, 255, 0.5);
  --accent-magenta: #ff2d75;
  --accent-purple: #a855f7;
  --accent-cyan: #22d3ee;
  --accent-gold: #fbbf24;
  --accent-pink: #f472b6;
  --accent-green: #34d399;
  --gradient-primary: linear-gradient(135deg, #ff2d75 0%, #a855f7 50%, #22d3ee 100%);
  --gradient-magenta: linear-gradient(135deg, #ff2d75 0%, #ff6b9d 100%);
  --gradient-purple: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
  --gradient-cyan: linear-gradient(135deg, #22d3ee 0%, #67e8f9 100%);
  --gradient-gold: linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%);
  --gradient-hero: radial-gradient(ellipse at 30% 20%, rgba(255, 45, 117, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(168, 85, 247, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 40%);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-glow: rgba(255, 45, 117, 0.4);
  --header-height: 72px;
  --container-max: 1400px;
  --container-padding: 24px;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.6);
  --shadow-glow-magenta: 0 0 40px rgba(255, 45, 117, 0.25);
  --shadow-glow-purple: 0 0 40px rgba(168, 85, 247, 0.25);
  --shadow-glow-cyan: 0 0 40px rgba(34, 211, 238, 0.25);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.6; min-height: 100vh; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
img, video { max-width: 100%; height: auto; display: block; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }

.app { display: flex; flex-direction: column; min-height: 100vh; }
.main { flex: 1; padding-top: var(--header-height); }
.container { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--container-padding); }
.section { padding: 60px 0; }
.section-dark { background: var(--bg-secondary); }

.header { position: fixed; top: 0; left: 0; right: 0; height: var(--header-height); background: rgba(10, 10, 18, 0.85); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid transparent; background-image: linear-gradient(rgba(10, 10, 18, 0.85), rgba(10, 10, 18, 0.85)), linear-gradient(90deg, rgba(255, 45, 117, 0.3) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(34, 211, 238, 0.3) 100%); background-origin: padding-box, border-box; background-clip: padding-box, border-box; z-index: 1000; }
.header-container { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--container-padding); height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.logo { display: flex; align-items: center; gap: 12px; font-size: 1.3rem; font-weight: 800; transition: all var(--transition-fast); text-decoration: none; }
.logo:hover { transform: scale(1.02); }
.logo-icon { font-size: 1.6rem; filter: drop-shadow(0 0 8px rgba(255, 45, 117, 0.5)); }
.logo-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.02em; }
.nav { display: flex; align-items: center; gap: 6px; padding: 6px; background: var(--bg-glass); border-radius: 16px; border: 1px solid var(--border-color); }
.nav-link { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); transition: all var(--transition-fast); position: relative; overflow: hidden; }
.nav-link:hover { color: var(--text-primary); background: var(--bg-glass-hover); }
.nav-link.active { color: var(--text-primary); background: var(--gradient-primary); box-shadow: 0 4px 15px rgba(255, 45, 117, 0.3); }
.nav-icon { font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.search-btn, .github-link { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; color: var(--text-secondary); background: var(--bg-glass); border: 1px solid var(--border-color); transition: all var(--transition-fast); }
.search-btn:hover, .github-link:hover { color: var(--text-primary); background: var(--bg-glass-hover); border-color: var(--accent-purple); box-shadow: var(--shadow-glow-purple); transform: translateY(-2px); }

.hero { position: relative; padding: 120px 0 100px; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; background: var(--gradient-hero); pointer-events: none; }
.hero-bg::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255, 45, 117, 0.03) 60deg, transparent 120deg, rgba(168, 85, 247, 0.03) 180deg, transparent 240deg, rgba(34, 211, 238, 0.03) 300deg, transparent 360deg); animation: rotate 30s linear infinite; }
.hero-bg::after { content: ''; position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255, 45, 117, 0.08) 0%, rgba(168, 85, 247, 0.05) 40%, transparent 70%); animation: pulse 6s ease-in-out infinite; filter: blur(40px); }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.2); } }
.hero-content { position: relative; max-width: 900px; margin: 0 auto; padding: 0 var(--container-padding); text-align: center; }
.hero-title { font-size: clamp(2.8rem, 7vw, 4.5rem); font-weight: 800; line-height: 1.05; margin-bottom: 28px; letter-spacing: -0.03em; }
.hero-title-line { display: block; color: var(--text-muted); font-weight: 500; font-size: 0.4em; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; }
.hero-title-gradient { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; }
.hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 48px; line-height: 1.7; }
.hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 72px; }
.hero-stats { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; }
.stat-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 36px; background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: var(--radius-lg); min-width: 150px; transition: all var(--transition-normal); position: relative; overflow: hidden; }
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--gradient-primary); opacity: 0; transition: opacity var(--transition-fast); }
.stat-card:hover { transform: translateY(-4px); border-color: var(--accent-magenta); }
.stat-card:hover::before { opacity: 1; }
.stat-icon { font-size: 2.2rem; line-height: 1; }
.stat-value { font-size: 2rem; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-label { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 28px; font-size: 0.95rem; font-weight: 600; border-radius: var(--radius-md); transition: all var(--transition-normal); cursor: pointer; border: none; text-decoration: none; }
.btn-large { padding: 18px 36px; font-size: 1rem; border-radius: var(--radius-lg); }
.btn-small { padding: 10px 18px; font-size: 0.85rem; }
.btn-primary { background: var(--gradient-primary); color: #fff; box-shadow: 0 4px 20px rgba(255, 45, 117, 0.35); position: relative; overflow: hidden; }
.btn-primary::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%); opacity: 0; transition: opacity var(--transition-fast); }
.btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 30px rgba(255, 45, 117, 0.45); }
.btn-primary:hover::before { opacity: 1; }
.btn-secondary { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); backdrop-filter: blur(10px); }
.btn-secondary:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-2px); box-shadow: var(--shadow-glow-purple); }
.btn-github { background: linear-gradient(135deg, #24292f 0%, #1a1e22 100%); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
.btn-github:hover { background: linear-gradient(135deg, #2c3238 0%, #24292f 100%); transform: translateY(-2px); }

.quick-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.quick-card { position: relative; padding: 36px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; transition: all var(--transition-normal); text-decoration: none; display: flex; flex-direction: column; gap: 16px; }
.quick-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--gradient-primary); opacity: 0; transition: opacity var(--transition-normal); }
.quick-card::after { content: ''; position: absolute; top: -50%; right: -50%; width: 100%; height: 100%; background: radial-gradient(circle, var(--card-glow, rgba(255, 45, 117, 0.08)) 0%, transparent 70%); opacity: 0; transition: opacity var(--transition-normal); pointer-events: none; }
.quick-card:hover { transform: translateY(-6px); border-color: var(--card-border, var(--accent-magenta)); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), var(--card-shadow, var(--shadow-glow-magenta)); }
.quick-card:hover::before { opacity: 1; }
.quick-card:hover::after { opacity: 1; }
.quick-card-images { --card-glow: rgba(34, 211, 238, 0.1); --card-border: var(--accent-cyan); --card-shadow: var(--shadow-glow-cyan); }
.quick-card-videos { --card-glow: rgba(244, 114, 182, 0.1); --card-border: var(--accent-pink); --card-shadow: 0 0 40px rgba(244, 114, 182, 0.25); }
.quick-card-explorer { --card-glow: rgba(251, 191, 36, 0.1); --card-border: var(--accent-gold); --card-shadow: 0 0 40px rgba(251, 191, 36, 0.2); }
.quick-card-icon { font-size: 3rem; line-height: 1; }
.quick-card-illustration { width: 120px; height: 120px; object-fit: contain; margin-bottom: 8px; }
.quick-card h3 { font-size: 1.35rem; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.quick-card p { color: var(--text-secondary); font-size: 0.95rem; margin: 0; line-height: 1.6; }
.quick-card-arrow { position: absolute; bottom: 28px; right: 28px; font-size: 1.5rem; color: var(--accent-magenta); opacity: 0; transform: translateX(-10px); transition: all var(--transition-normal); }
.quick-card:hover .quick-card-arrow { opacity: 1; transform: translateX(0); }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.section-title { font-size: 1.75rem; font-weight: 700; }
.section-link { color: var(--accent-purple); font-weight: 500; transition: color var(--transition-fast); }
.section-link:hover { color: var(--accent-cyan); }
.back-link-top { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; color: var(--text-secondary); font-weight: 500; transition: color var(--transition-fast); }
.back-link-top:hover { color: var(--accent-purple); text-decoration: none; }

.page-header { padding: 60px 0 40px; background: var(--gradient-hero); }
.page-header-explorer { text-align: center; }
.page-header-content { display: flex; flex-direction: column; gap: 12px; }
.page-title { display: flex; align-items: center; gap: 16px; font-size: 2.5rem; font-weight: 700; }
.page-icon { font-size: 1em; }
.page-subtitle { color: var(--text-secondary); font-size: 1.1rem; }

.media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.media-card { display: flex; flex-direction: column; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal); animation: fadeIn 0.4s ease backwards; }
.media-card:hover { transform: translateY(-4px); border-color: rgba(139, 92, 246, 0.3); box-shadow: var(--shadow-lg); }
.media-card-image { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--bg-tertiary); }
.media-card-image > img, .media-card-image > video { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.media-card:hover .media-card-image > img, .media-card:hover .media-card-image > video { transform: scale(1.05); }
.media-type-badge { position: absolute; top: 12px; left: 12px; padding: 6px 12px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); border-radius: 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; z-index: 2; display: flex; align-items: center; gap: 4px; }
.media-type-badge.image { color: var(--accent-cyan); }
.media-type-badge.video { color: var(--accent-pink); }
.media-card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)); opacity: 0; transition: opacity var(--transition-normal); z-index: 3; }
.media-card:hover .media-card-overlay { opacity: 1; }
/* Fixed like button - no flicker on hover */
.like-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(30, 30, 50, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; color: #fff; font-size: 0.85rem; font-weight: 500; transition: background var(--transition-fast), border-color var(--transition-fast); }
.like-btn:hover { background: rgba(236, 72, 153, 0.4); border-color: rgba(236, 72, 153, 0.5); }
.like-btn.liked { background: var(--accent-pink); border-color: var(--accent-pink); }
.like-btn svg { width: 18px; height: 18px; }
.like-btn.liked svg { fill: currentColor; }
.media-card-content { padding: 20px; }
.media-card-title { font-size: 1rem; font-weight: 600; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.media-card-desc { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
/* Uploader info on cards */
.media-card-uploader { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px; }
.media-card-uploader svg { opacity: 0.6; flex-shrink: 0; }
.uploader-link { color: var(--accent-cyan); transition: color var(--transition-fast); }
.uploader-link:hover { color: var(--accent-purple); text-decoration: underline; }
.uploader-name { color: var(--text-secondary); }
/* Carousel for multi-image cards */
.media-carousel { position: relative; width: 100%; height: 100%; }
.carousel-track { position: relative; width: 100%; height: 100%; }
/* First slide is relative to establish height, others are absolute on top */
.carousel-slide { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease; }
.carousel-slide:first-child { position: relative; display: block; }
.carousel-slide:not(:first-child) { position: absolute; top: 0; left: 0; }
.carousel-slide:not(.active) { opacity: 0; pointer-events: none; }
.carousel-slide.active { opacity: 1; pointer-events: auto; z-index: 1; }
.carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: #fff; cursor: pointer; opacity: 0; transition: opacity var(--transition-fast), background var(--transition-fast); z-index: 5; }
.media-card:hover .carousel-btn { opacity: 1; }
.carousel-btn:hover { background: rgba(168, 85, 247, 0.8); }
.carousel-prev { left: 8px; }
.carousel-next { right: 8px; }
.carousel-dots { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 4; }
.carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); transition: background var(--transition-fast), transform var(--transition-fast); }
.carousel-dot.active { background: #fff; transform: scale(1.2); }
.media-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-chip-small { padding: 4px 10px; background: var(--bg-tertiary); border-radius: 6px; font-size: 0.75rem; color: var(--text-muted); }
.tag-more { padding: 4px 10px; background: var(--bg-glass); border-radius: 6px; font-size: 0.75rem; color: var(--accent-purple); }

.tag-cloud { display: flex; flex-wrap: wrap; gap: 12px; }
.tag-chip { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; transition: all var(--transition-fast); }
.tag-chip:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-2px); }
.tag-chip-large { padding: 12px 20px; font-size: 0.95rem; }
.tag-name { font-weight: 500; }
.tag-count { color: var(--text-muted); font-size: 0.85em; }
.tags-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.tag-card { display: flex; flex-direction: column; gap: 4px; padding: 20px 24px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; transition: all var(--transition-fast); }
.tag-card:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-2px); }
.tag-card-name { font-weight: 600; font-size: 1rem; }
.tag-card-count { color: var(--text-muted); font-size: 0.85rem; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 48px; flex-wrap: wrap; }
.pagination-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); font-weight: 500; transition: all var(--transition-fast); }
.pagination-btn:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); transform: translateY(-1px); }
.pagination-btn.first, .pagination-btn.last { padding: 10px 12px; }
.pagination-btn-text { display: inline; }
@media (max-width: 600px) { .pagination-btn-text { display: none; } }
.pagination-pages { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: center; }
.pagination-page { display: flex; align-items: center; justify-content: center; min-width: 40px; height: 40px; padding: 0 8px; border-radius: 8px; font-weight: 500; transition: all var(--transition-fast); background: var(--bg-glass); border: 1px solid transparent; }
.pagination-page:hover { background: var(--bg-glass-hover); border-color: var(--accent-purple); }
.pagination-page.active { background: var(--gradient-primary); color: #fff; border-color: transparent; box-shadow: 0 2px 10px rgba(255, 45, 117, 0.3); }
.pagination-ellipsis { color: var(--text-muted); padding: 0 4px; font-size: 0.9rem; }

.search-section { padding: 24px 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); }
.search-form { display: flex; flex-direction: column; gap: 16px; }
.search-input-wrapper { position: relative; }
.search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-input { width: 100%; padding: 18px 20px 18px 56px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 14px; color: var(--text-primary); font-size: 1rem; transition: border-color var(--transition-fast); }
.search-input:focus { outline: none; border-color: var(--accent-purple); }
.search-input::placeholder { color: var(--text-muted); }
.search-filters { display: flex; gap: 12px; flex-wrap: wrap; }
.search-select, .search-tag-input { padding: 12px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); font-size: 0.9rem; }
.search-select { min-width: 140px; }
.json-code { font-family: 'Fira Code', monospace; background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 8px; font-size: 0.9rem; line-height: 1.5; color: #a7f3d0; white-space: pre-wrap; word-break: break-all; border: 1px solid rgba(255, 255, 255, 0.1); }
.search-tag-input { flex: 1; min-width: 200px; }
.search-submit { padding: 12px 28px; background: var(--gradient-primary); border-radius: 10px; color: #fff; font-weight: 600; transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
.search-submit:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3); }
.search-results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.results-count { color: var(--text-secondary); }
.results-count strong { color: var(--text-primary); }
.clear-filters { color: var(--accent-purple); font-weight: 500; }
.clear-filters:hover { text-decoration: underline; }

.item-detail { padding: 60px 0; }
.item-detail-grid { display: grid; grid-template-columns: 1fr; gap: 40px; }
/* Stacked layout always - removed desktop columns */
.item-media { background: var(--bg-secondary); border-radius: 20px; overflow: hidden; }
.item-image, .item-video { width: 100%; max-height: 600px; object-fit: contain; background: var(--bg-tertiary); }
.item-info { display: flex; flex-direction: column; gap: 24px; }
.item-type-badge-large { display: inline-flex; align-self: flex-start; padding: 8px 16px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.85rem; font-weight: 600; }
.item-title { font-size: 1.75rem; font-weight: 700; line-height: 1.3; }
.item-description h2 { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; }
.prompt-box { position: relative; padding: 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; }
.prompt-box p { font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary); white-space: pre-wrap; }
.copy-btn { position: absolute; top: 12px; right: 12px; padding: 8px 14px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 0.8rem; font-weight: 500; transition: all var(--transition-fast); }
.copy-btn:hover { background: var(--accent-purple); border-color: var(--accent-purple); }
.like-btn-large { display: inline-flex; align-items: center; gap: 10px; padding: 14px 24px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-primary); font-size: 1rem; font-weight: 500; transition: all var(--transition-fast); }
.like-btn-large:hover { background: rgba(236, 72, 153, 0.2); border-color: var(--accent-pink); }
.like-btn-large.liked { background: var(--accent-pink); border-color: var(--accent-pink); }
.like-btn-large svg { width: 22px; height: 22px; }
.item-tags h3 { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; }
.item-actions { display: flex; gap: 12px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid var(--border-color); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 4rem; margin-bottom: 24px; }
.empty-state h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 8px; }
.empty-state p { color: var(--text-secondary); margin-bottom: 24px; }

.load-more-wrapper { display: flex; justify-content: center; margin-top: 48px; }

.github-cta { display: flex; align-items: center; justify-content: space-between; gap: 32px; padding: 40px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 20px; flex-wrap: wrap; }
.github-cta h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }
.github-cta p { color: var(--text-secondary); }

.footer { background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%); border-top: 1px solid transparent; background-image: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%), linear-gradient(90deg, rgba(255, 45, 117, 0.2) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(34, 211, 238, 0.2) 100%); background-origin: padding-box, border-box; background-clip: padding-box, border-box; padding: 80px 0 40px; position: relative; }
.footer::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%); pointer-events: none; }
.footer-container { max-width: var(--container-max); margin: 0 auto; padding: 0 var(--container-padding); position: relative; }
.footer-brand { margin-bottom: 48px; }
.footer-logo { font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.footer-logo-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.footer-tagline { color: var(--text-muted); font-size: 0.95rem; }
.footer-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 40px; margin-bottom: 48px; }
.footer-section h4 { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 20px; }
.footer-section a { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); padding: 8px 0; transition: all var(--transition-fast); font-size: 0.95rem; }
.footer-section a:hover { color: var(--text-primary); transform: translateX(4px); }
.footer-bottom { padding-top: 32px; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-muted); font-size: 0.9rem; }
.footer-bottom a { color: var(--accent-magenta); transition: color var(--transition-fast); }
.footer-bottom a:hover { color: var(--accent-pink); text-decoration: none; }

/* Multi-image badge on cards */
.media-multi-badge { position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 4px; padding: 6px 10px; background: rgba(168, 85, 247, 0.9); backdrop-filter: blur(10px); border-radius: 8px; font-size: 0.75rem; font-weight: 600; color: #fff; }
.media-multi-badge svg { opacity: 0.9; }

/* Image gallery on detail page */
.item-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.gallery-item { position: relative; display: block; border-radius: 12px; overflow: hidden; background: var(--bg-tertiary); transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
.gallery-item:hover { transform: scale(1.02); box-shadow: var(--shadow-lg); }
.gallery-image { width: 100%; height: auto; display: block; }
.gallery-index { position: absolute; bottom: 8px; right: 8px; padding: 4px 10px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); border-radius: 6px; font-size: 0.75rem; font-weight: 500; color: #fff; }
.image-count-badge { margin-left: 8px; padding: 2px 8px; background: var(--accent-purple); border-radius: 6px; font-size: 0.75rem; }

/* Attribution section */
.item-attribution { display: flex; flex-direction: column; gap: 12px; padding: 16px 20px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 8px; }
.attribution-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.attribution-label { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 0.9rem; }
.attribution-label svg { opacity: 0.7; }
.attribution-link { color: var(--accent-cyan); font-weight: 500; transition: color var(--transition-fast); }
.attribution-link:hover { color: var(--accent-purple); text-decoration: underline; }
.attribution-value { color: var(--text-primary); font-weight: 500; }

@media (max-width: 768px) {
  :root { --container-padding: 16px; }
  .nav-label { display: none; }
  .nav-link { padding: 10px 12px; }
  .hero { padding: 60px 0 40px; }
  .hero-stats { gap: 12px; }
  .stat-card { padding: 16px 20px; min-width: 100px; }
  .page-title { font-size: 1.75rem; }
  .media-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .search-filters { flex-direction: column; }
  .search-select, .search-tag-input { width: 100%; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.media-card:nth-child(1) { animation-delay: 0.05s; }
.media-card:nth-child(2) { animation-delay: 0.1s; }
.media-card:nth-child(3) { animation-delay: 0.15s; }
.media-card:nth-child(4) { animation-delay: 0.2s; }
.media-card:nth-child(5) { animation-delay: 0.25s; }
.media-card:nth-child(6) { animation-delay: 0.3s; }
`;

// Inline JavaScript for client-side functionality
const inlineJS = `
async function toggleLike(button) {
  const id = button.dataset.id;
  const countEl = button.querySelector('.like-count');
  const isLiked = button.classList.contains('liked');
  try {
    const method = isLiked ? 'DELETE' : 'POST';
    const res = await fetch('/api/like/' + id, { method });
    const data = await res.json();
    if (data.likes !== undefined) {
      countEl.textContent = data.likes;
      button.classList.toggle('liked');
    }
  } catch (error) { console.error('Error toggling like:', error); }
}

// Carousel navigation functions
function carouselNext(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  const current = parseInt(carousel.dataset.current);
  const total = parseInt(carousel.dataset.total);
  const next = (current + 1) % total;
  updateCarousel(carousel, next);
}

function carouselPrev(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  const current = parseInt(carousel.dataset.current);
  const total = parseInt(carousel.dataset.total);
  const prev = current === 0 ? total - 1 : current - 1;
  updateCarousel(carousel, prev);
}

function updateCarousel(carousel, newIndex) {
  carousel.dataset.current = newIndex;
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === newIndex);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === newIndex);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      const grid = document.getElementById('explorer-grid');
      const seed = loadMoreBtn.dataset.seed;
      const nextPage = parseInt(loadMoreBtn.dataset.nextPage);
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Loading...';
      try {
        const res = await fetch('/api/explorer?seed=' + seed + '&page=' + nextPage + '&limit=30');
        const data = await res.json();
        const mediaGrid = grid.querySelector('.media-grid');
        data.data.forEach(item => {
          const card = document.createElement('a');
          card.href = '/item/' + item.id;
          card.className = 'media-card';
          card.innerHTML = '<div class="media-card-image">' +
            (item.type === 'video' ? '<video src="' + item.url + '" muted loop preload="metadata"></video>' : '<img src="' + item.url + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy"/>') +
            '<span class="media-type-badge ' + item.type + '">' + (item.type === 'video' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>') + ' <span>' + item.type + '</span></span>' +
            '<div class="media-card-overlay"><button class="like-btn" data-id="' + item.id + '" onclick="event.preventDefault();event.stopPropagation();toggleLike(this);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="like-count">' + item.likes + '</span></button></div></div>' +
            '<div class="media-card-content"><h3 class="media-card-title">' + item.title + '</h3>' +
            (item.description ? '<p class="media-card-desc">' + item.description.slice(0, 120) + '...</p>' : '') +
            '<div class="media-card-tags">' + item.tags.slice(0, 3).map(t => '<span class="tag-chip-small">' + t + '</span>').join('') +
            (item.tags.length > 3 ? '<span class="tag-more">+' + (item.tags.length - 3) + '</span>' : '') +
            '</div></div>';
          mediaGrid.appendChild(card);
        });
        if (data.has_more) {
          loadMoreBtn.dataset.nextPage = nextPage + 1;
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = 'Load More';
        } else {
          loadMoreBtn.parentElement.remove();
        }
      } catch (error) {
        console.error('Error loading more:', error);
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Try Again';
      }
    });
  }
  document.querySelectorAll('.media-card video').forEach(video => {
    const card = video.closest('.media-card');
    card.addEventListener('mouseenter', () => video.play());
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  });
});
`;

// Serve CSS
app.get('/styles.css', (c) => {
  return c.text(inlineCSS, 200, { 'Content-Type': 'text/css' });
});

// Serve JS
app.get('/app.js', (c) => {
  return c.text(inlineJS, 200, { 'Content-Type': 'application/javascript' });
});

// Debug manifest keys
app.get('/api/debug-manifest', (c) => {
  return c.json(manifest);
});

// Home page
app.get('/', async (c) => {
  let tagsData = { tags: [], total: 0 } as TagsResponse;
  try {
    tagsData = await fetchTags();
  } catch (e) {
    console.error('Home Page Error (Tags):', e);
  }

  const stats = {
    total_items: 5514,
    images: 3611,
    videos: 1903,
    tags: tagsData.total || 0
  };

  return c.html(<HomePage stats={stats} featuredTags={tagsData.tags} />);
});

// Explorer page
app.get('/explorer', async (c) => {
  const seed = c.req.query('seed');
  const page = parseInt(c.req.query('page') || '1');

  let data = { data: [], seed: '', page: 1, has_more: false, next_page: null, limit: 30, total: 0, total_pages: 0 } as ExplorerResponse;
  try {
    data = await fetchExplorer(seed, page, 30);
  } catch (e) {
    console.error('Explorer Error:', e);
  }

  return c.html(
    <ExplorerPage
      items={data.data}
      seed={data.seed}
      page={data.page}
      hasMore={data.has_more}
    />
  );
});

// Images gallery - shuffle for variety
app.get('/images', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  let data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false } as PaginatedResponse<PromptItem>;

  try {
    data = await fetchImages(page, 24);
  } catch (e) {
    console.error('Images Gallery Error:', e);
  }

  // Shuffle items for variety on each page load
  const shuffledItems = [...(data.data || [])].sort(() => Math.random() - 0.5);

  return c.html(
    <GalleryPage
      type="images"
      items={shuffledItems}
      page={data.page}
      totalPages={data.total_pages}
      total={data.total}
    />
  );
});

// Videos gallery - shuffle for variety
app.get('/videos', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  let data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false } as PaginatedResponse<PromptItem>;

  try {
    data = await fetchVideos(page, 24);
  } catch (e) {
    console.error('Videos Gallery Error:', e);
  }

  // Shuffle items for variety on each page load
  const shuffledItems = [...(data.data || [])].sort(() => Math.random() - 0.5);

  return c.html(
    <GalleryPage
      type="videos"
      items={shuffledItems}
      page={data.page}
      totalPages={data.total_pages}
      total={data.total}
    />
  );
});

// Tags page
app.get('/tags', async (c) => {
  let data = { tags: [], total: 0 } as TagsResponse;
  try {
    data = await fetchTags();
  } catch (e) {
    console.error('Tags Page Error:', e);
  }

  return c.html(<TagsPage tags={data.tags} total={data.total} />);
});

// Search page
app.get('/search', async (c) => {
  const query = c.req.query('q');
  const tag = c.req.query('tag');
  const type = c.req.query('type') as 'image' | 'video' | undefined;
  const page = parseInt(c.req.query('page') || '1');

  const hasFilters = query || tag || type;

  let data: PaginatedResponse<PromptItem>;
  if (hasFilters) {
    try {
      data = await search(query, tag, undefined, type, page, 24);
    } catch (e) {
      console.error('Search Error:', e);
      data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false };
    }
  } else {
    data = { data: [], page: 1, total_pages: 0, total: 0, limit: 24, has_more: false };
  }

  return c.html(
    <SearchPage
      items={data.data}
      query={query}
      tag={tag}
      type={type}
      page={data.page}
      totalPages={data.total_pages}
      total={data.total}
    />
  );
});

// Single item page
app.get('/item/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const item = await getItem(id);
    return c.html(<ItemDetailPage item={item} />);
  } catch (e) {
    console.error('Item Detail Error:', e);
    return c.text('Item not found or API unavailable', 404);
  }
});

// API endpoints for client-side interactions
app.post('/api/like/:id', async (c) => {
  const id = c.req.param('id');
  const result = await likeItem(id);
  return c.json(result);
});

app.delete('/api/like/:id', async (c) => {
  const id = c.req.param('id');
  const result = await unlikeItem(id);
  return c.json(result);
});

// API endpoint for explorer infinite scroll
app.get('/api/explorer', async (c) => {
  const seed = c.req.query('seed');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '30');

  const data = await fetchExplorer(seed, page, limit);
  return c.json(data);
});

export default app;
