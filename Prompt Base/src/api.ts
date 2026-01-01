// API client for Prompt Base API

// TODO: Replace with your actual API endpoint
const API_BASE = 'https://your-api.example.com';

// Helper for robust API calls
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const fetchOptions: RequestInit = {
            ...options,
            headers: {
                ...options.headers,
                'User-Agent': 'PromptBase-Client/1.0',
                'Accept': 'application/json'
            }
        };
        const res = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
        if (!res.ok) {
            const text = await res.text();
            console.error(`API Error ${res.status} on ${endpoint}:`, text.slice(0, 200));
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        return await res.json() as T;
    } catch (e) {
        console.error(`Fetch failed for ${endpoint}:`, e);
        throw e;
    }
}

export interface PromptItem {
    id: string;
    title: string;
    description: string;
    promptData: string; // Separated prompt data
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    tags: string[];
    likes: number;
    createdAt?: string;
    // Multiple images support
    imgUrls?: string[];
    // Source/attribution info
    sourceUrl?: string;
    uploader?: string;
    uploaderUrl?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_more: boolean;
}

export interface ExplorerResponse extends PaginatedResponse<PromptItem> {
    seed: string;
    next_page: number | null;
}

export interface TagInfo {
    name: string;
    count: number;
}

export interface TagsResponse {
    total: number;
    tags: TagInfo[];
}

export interface LikeResponse {
    id: string;
    likes: number;
    message: string;
}

// Raw API item response (before normalization)
interface RawPromptItem {
    id: string;
    title: string;
    description?: string;
    prompt_data?: any; // Can be string or object
    type: 'image' | 'video';
    // Image fields
    full_image_url?: string;
    thumbnail_url?: string;
    img_urls?: string[];
    // Video fields
    video_url?: string;
    poster_url?: string;
    // Common fields
    url?: string;
    thumbnail?: string;
    tags: string[];
    likes: number;
    // Source/attribution
    source_url?: string;
    uploader?: string;
    uploader_url?: string;
}

// Helper to extract description from prompt_data
function extractDescription(item: RawPromptItem): string {
    // 0. Try prompt_data first (PRIORITY)
    if (item.prompt_data) {
        if (typeof item.prompt_data === 'string') {
            try {
                const parsed = JSON.parse(item.prompt_data);
                if (typeof parsed === 'object' && parsed !== null) {
                    if (parsed.prompt) return parsed.prompt;
                    if (parsed.description) {
                        const desc = parsed.description;
                        if (typeof desc === 'string' && (desc.trim().startsWith('{') || desc.trim().startsWith('['))) { // Nested JSON
                            try { return JSON.stringify(JSON.parse(desc), null, 2); } catch (e) { }
                        }
                        return typeof desc === 'string' ? desc : JSON.stringify(desc, null, 2);
                    }
                    return JSON.stringify(parsed, null, 2);
                }
                return item.prompt_data;
            } catch (e) { return item.prompt_data; }
        }
        if (typeof item.prompt_data === 'object') {
            if (item.prompt_data.prompt) return item.prompt_data.prompt;
            if (item.prompt_data.description) {
                const desc = item.prompt_data.description;
                if (typeof desc === 'string' && (desc.trim().startsWith('{') || desc.trim().startsWith('['))) { // Nested JSON
                    try { return JSON.stringify(JSON.parse(desc), null, 2); } catch (e) { }
                }
                return typeof desc === 'string' ? desc : JSON.stringify(desc, null, 2);
            }
            return JSON.stringify(item.prompt_data, null, 2);
        }
    }

    // 1. Try top-level description
    if (item.description && item.description.trim().length > 0) {
        return item.description;
    }

    // 2. Try prompt_data
    if (item.prompt_data) {
        // If string, try to parse as JSON or use as is
        if (typeof item.prompt_data === 'string') {
            try {
                const parsed = JSON.parse(item.prompt_data);
                // If parsed is object, check its fields
                if (typeof parsed === 'object' && parsed !== null) {
                    if (parsed.description) return typeof parsed.description === 'string' ? parsed.description : JSON.stringify(parsed.description, null, 2);
                    if (parsed.prompt) return parsed.prompt;
                    // If no specific field, return the pretty printed object
                    return JSON.stringify(parsed, null, 2);
                }
                return item.prompt_data;
            } catch (e) {
                // Not JSON, just return string
                return item.prompt_data;
            }
        }

        // If object
        if (typeof item.prompt_data === 'object') {
            if (item.prompt_data.description) {
                const desc = item.prompt_data.description;
                // Check if the description itself is a stringified JSON
                if (typeof desc === 'string' && (desc.trim().startsWith('{') || desc.trim().startsWith('['))) {
                    try {
                        const nestedJson = JSON.parse(desc);
                        return JSON.stringify(nestedJson, null, 2);
                    } catch (e) {
                        return desc;
                    }
                }
                return typeof desc === 'string' ? desc : JSON.stringify(desc, null, 2);
            }
            if (item.prompt_data.prompt) return item.prompt_data.prompt;
            // Fallback: pretty print the whole object
            return JSON.stringify(item.prompt_data, null, 2);
        }
    }

    return '';
}

// Helper to recursively parse JSON strings within an object
function recursiveParse(obj: any): any {
    if (typeof obj === 'string') {
        const trimmed = obj.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(obj);
                return recursiveParse(parsed);
            } catch (e) {
                return obj;
            }
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(recursiveParse);
    }
    if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = recursiveParse(obj[key]);
        }
        return newObj;
    }
    return obj;
}

// Helper to extract prompt data (rich content)
function extractPromptData(item: RawPromptItem): string {
    if (item.prompt_data) {
        try {
            let data = item.prompt_data;
            // First parse if top-level is string
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    // Not JSON string, return as is (but whitespace might be an issue, so maybe trim?)
                    // If it's just a raw prompt string, it's fine.
                    return data;
                }
            }

            // Now recursively parse any nested strings
            const parsedData = recursiveParse(data);

            // Return pretty-printed JSON
            return JSON.stringify(parsedData, null, 2);
        } catch (e) {
            // Fallback
            return typeof item.prompt_data === 'string' ? item.prompt_data : JSON.stringify(item.prompt_data, null, 2);
        }
    }
    return '';
}

// Normalize API response to expected format
function normalizeItem(item: RawPromptItem): PromptItem {
    return {
        id: item.id,
        title: item.title,
        description: item.description || '', // Keep description separate
        promptData: extractPromptData(item), // Extract prompt data separately
        type: item.type,
        // For images: use full_image_url, for videos: use video_url, fallback to url
        url: item.full_image_url || item.video_url || item.url || '',
        // For images: use thumbnail_url, for videos: use poster_url, fallback to thumbnail
        thumbnail: item.thumbnail_url || item.poster_url || item.thumbnail,
        tags: item.tags || [],
        likes: item.likes || 0,
        // Multiple images - use img_urls array if available
        imgUrls: item.img_urls && item.img_urls.length > 0 ? item.img_urls : undefined,
        // Source/attribution info
        sourceUrl: item.source_url,
        uploader: item.uploader,
        uploaderUrl: item.uploader_url,
    };
}

// Normalize array of items
function normalizeItems(items: RawPromptItem[]): PromptItem[] {
    return items.map(normalizeItem);
}

// Fetch all items with pagination
export async function fetchAll(page = 1, limit = 50): Promise<PaginatedResponse<PromptItem>> {
    const data = await fetchApi<any>(`/all?page=${page}&limit=${limit}`);
    // Normalize items to expected format
    data.data = normalizeItems(data.data || []);
    // Compute total_pages if not provided by API
    if (data.total_pages === undefined && data.total !== undefined && data.limit) {
        data.total_pages = Math.ceil(data.total / data.limit);
    }
    if (data.has_more === undefined) {
        data.has_more = data.page < data.total_pages;
    }
    return data;
}

// Fetch only images
export async function fetchImages(page = 1, limit = 50): Promise<PaginatedResponse<PromptItem>> {
    const data = await fetchApi<any>(`/images?page=${page}&limit=${limit}`);
    // Normalize items to expected format
    data.data = normalizeItems(data.data || []);
    // Compute total_pages if not provided by API
    if (data.total_pages === undefined && data.total !== undefined && data.limit) {
        data.total_pages = Math.ceil(data.total / data.limit);
    }
    if (data.has_more === undefined) {
        data.has_more = data.page < data.total_pages;
    }
    return data;
}

// Fetch only videos
export async function fetchVideos(page = 1, limit = 50): Promise<PaginatedResponse<PromptItem>> {
    const data = await fetchApi<any>(`/videos?page=${page}&limit=${limit}`);
    // Normalize items to expected format
    data.data = normalizeItems(data.data || []);
    // Compute total_pages if not provided by API
    if (data.total_pages === undefined && data.total !== undefined && data.limit) {
        data.total_pages = Math.ceil(data.total / data.limit);
    }
    if (data.has_more === undefined) {
        data.has_more = data.page < data.total_pages;
    }
    return data;
}

// Fetch explorer (random seeded feed)
export async function fetchExplorer(seed?: string, page = 1, limit = 30): Promise<ExplorerResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (seed) params.set('seed', seed);
    const data = await fetchApi<any>(`/explorer?${params}`);
    // Normalize items to expected format
    data.data = normalizeItems(data.data || []);
    return data;
}

// Fetch all tags
export async function fetchTags(): Promise<TagsResponse> {
    return fetchApi<TagsResponse>('/tags');
}

// Search items
export async function search(
    query?: string,
    tag?: string,
    tags?: string[],
    type?: 'image' | 'video',
    page = 1,
    limit = 50
): Promise<PaginatedResponse<PromptItem>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (query) params.set('q', query);
    if (tag) params.set('tag', tag);
    if (tags && tags.length) params.set('tags', tags.join(','));
    if (type) params.set('type', type);
    const data = await fetchApi<any>(`/search?${params}`);
    // Normalize items to expected format
    data.data = normalizeItems(data.data || []);
    // Compute total_pages if not provided by API
    if (data.total_pages === undefined && data.total !== undefined && data.limit) {
        data.total_pages = Math.ceil(data.total / data.limit);
    }
    if (data.has_more === undefined) {
        data.has_more = data.page < data.total_pages;
    }
    return data;
}

// Get single item
export async function getItem(id: string): Promise<PromptItem> {
    const data = await fetchApi<RawPromptItem>(`/item/${id}`);
    return normalizeItem(data);
}

// Like an item
export async function likeItem(id: string): Promise<LikeResponse> {
    return fetchApi<LikeResponse>(`/like/${id}`, { method: 'POST' });
}

// Unlike an item
export async function unlikeItem(id: string): Promise<LikeResponse> {
    return fetchApi<LikeResponse>(`/like/${id}`, { method: 'DELETE' });
}

// Get likes count
export async function getLikes(id: string): Promise<{ id: string; likes: number }> {
    return fetchApi<{ id: string; likes: number }>(`/likes/${id}`);
}
