export interface SearchFilters {
    min_views?: number;
    min_subscribers?: number;
    country_code?: string;
}

export interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    viewCount: number;
    subscriberCount: number;
    publishedAt: string;
    url: string;
}

export interface SearchResponse {
    videos: Video[];
    related_terms: string[];
} 