import type { FC } from 'hono/jsx';

export const Footer: FC = () => {
    const sparkleIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#footer-gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="footer-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff2d75" /><stop offset="50%" stop-color="#a855f7" /><stop offset="100%" stop-color="#22d3ee" /></linearGradient></defs><path d="M12 3v5m0 8v5m9-9h-5m-8 0H3m15.364-6.364-3.536 3.536m-7.07 7.071-3.536 3.536M18.364 18.364l-3.536-3.536M7.757 7.757 4.221 4.221" /></svg>;

    return (
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-brand">
                    <div class="footer-logo">
                        {sparkleIcon}
                        <span class="footer-logo-text">Prompt Base</span>
                    </div>
                    <p class="footer-tagline">Your gateway to AI-generated creative prompts</p>
                </div>

                <div class="footer-links">
                    <div class="footer-section">
                        <h4>Browse</h4>
                        <a href="/explorer">Explorer</a>
                        <a href="/images">Images</a>
                        <a href="/videos">Videos</a>
                        <a href="/tags">Tags</a>
                    </div>

                    <div class="footer-section">
                        <h4>Resources</h4>
                        <a href="https://github.com/your-username/prompt-base" target="_blank" rel="noopener">
                            GitHub Repository
                        </a>
                        <a href="https://your-website.example.com/" target="_blank" rel="noopener">
                            Your Company
                        </a>
                        <a href="https://play.google.com/store/apps/developer?id=Your+Company" target="_blank" rel="noopener">
                            Google Play
                        </a>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; 2026 Prompt Base by <a href="https://github.com/your-username" target="_blank" rel="noopener">Your Company</a></p>
                </div>
            </div>
        </footer>
    );
};
