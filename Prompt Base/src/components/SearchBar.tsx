import type { FC } from 'hono/jsx';

interface SearchBarProps {
    query?: string;
    tag?: string;
    type?: string;
    placeholder?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
    query = '',
    tag = '',
    type = '',
    placeholder = 'Search prompts...'
}) => {
    return (
        <form action="/search" method="GET" class="search-form">
            <div class="search-input-wrapper">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    name="q"
                    value={query}
                    placeholder={placeholder}
                    class="search-input"
                    autocomplete="off"
                />
            </div>

            <div class="search-filters">
                <select name="type" class="search-select">
                    <option value="">All Types</option>
                    <option value="image" selected={type === 'image'}>🖼️ Images</option>
                    <option value="video" selected={type === 'video'}>🎬 Videos</option>
                </select>

                <input
                    type="text"
                    name="tag"
                    value={tag}
                    placeholder="Filter by tag..."
                    class="search-tag-input"
                />

                <button type="submit" class="search-submit">
                    Search
                </button>
            </div>
        </form>
    );
};
