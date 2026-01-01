import type { FC } from 'hono/jsx';

interface HeaderProps {
    currentPath?: string;
}

export const Header: FC<HeaderProps> = ({ currentPath = '/' }) => {
    // SVG Icons as components for cleaner code
    const icons = {
        home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        explorer: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v4l2 2" /><circle cx="12" cy="12" r="1" /></svg>,
        images: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
        videos: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>,
        tags: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>,
        sparkle: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v5m0 8v5m9-9h-5m-8 0H3m15.364-6.364-3.536 3.536m-7.07 7.071-3.536 3.536M18.364 18.364l-3.536-3.536M7.757 7.757 4.221 4.221" /></svg>
    };

    const navLinks = [
        { href: '/', label: 'Home', icon: icons.home },
        { href: '/explorer', label: 'Explorer', icon: icons.explorer },
        { href: '/images', label: 'Images', icon: icons.images },
        { href: '/videos', label: 'Videos', icon: icons.videos },
        { href: '/tags', label: 'Tags', icon: icons.tags },
    ];

    return (
        <header class="header">
            <div class="header-container">
                <a href="/" class="logo">
                    <span class="logo-icon">{icons.sparkle}</span>
                    <span class="logo-text">Prompt Base</span>
                </a>

                <nav class="nav">
                    {navLinks.map(link => (
                        <a
                            href={link.href}
                            class={`nav-link ${currentPath === link.href ? 'active' : ''}`}
                        >
                            <span class="nav-icon">{link.icon}</span>
                            <span class="nav-label">{link.label}</span>
                        </a>
                    ))}
                </nav>

                <div class="header-actions">
                    <a href="/search" class="search-btn" aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </a>
                    <a
                        href="https://github.com/Ionic-Errrrs-Code/awesome-nanobanana-pro-prompts"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="github-link"
                        aria-label="View on GitHub"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </div>
        </header>
    );
};
