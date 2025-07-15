// API Response Types
export interface VideoData {
  id: string;
  title: string;
  description: string;
  channel_title: string;
  channel_url: string;
  thumbnail: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  subscriber_count: number;
  channel_video_count: number;
  channel_total_views: number;
  average_view_count: number;
  tags: string[];
  links: string[];
  email?: string;
  last_3_videos?: Last3Video[];
  channel_published_at?: string;
  channel_default_language?: string;
  licensed_content?: boolean;
  projection?: string;
  channel_hidden_subscriber_count?: boolean;
  caption_available?: boolean;
}

export interface Last3Video {
  title: string;
  description: string;
  view_count: number;
}

export interface SearchFilters {
  limit: number;
  min_views?: number;
  min_subscribers?: number;
  country_code?: string;
}

export interface SearchResponse {
  results: VideoData[];
  related_keywords?: string[];
}

export interface EmailExtractionRequest {
  video_urls: Array<{
    id: string;
    url: string;
  }>;
}

export interface EmailExtractionResponse {
  video_url: {
    id: string;
    url: string;
  };
  email: string;
  error: string | null;
  links: string[];
}

// Grid Types for MUI DataGrid - using MUI's built-in types
import type { GridFilterModel, GridSortModel, GridCallbackDetails } from '@mui/x-data-grid';

export type { GridFilterModel, GridSortModel, GridCallbackDetails };

// Component Props Types
export interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  loading: boolean;
}

export interface VideoResultsTableProps {
  videos: VideoData[];
  loading: boolean;
  selectedRows: VideoData[];
  onRowSelectionChange: (selectedRows: VideoData[]) => void;
  onExtractEmails: () => void;
  extractingEmails: boolean;
  page: number;
  pageSize: number;
  filterModel: GridFilterModel;
  sortModel: GridSortModel;
  onPaginationModelChange: (model: any) => void;
  onFilterModelChange: (model: GridFilterModel, details: GridCallbackDetails<any>) => void;
  onSortModelChange: (model: GridSortModel, details: GridCallbackDetails<any>) => void;
}

export interface Last3VideosTableProps {
  videos: Last3Video[];
}

export interface RelatedTermsProps {
  terms: string[];
  onTermClick: (term: string) => void;
}

export interface SearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  loading: boolean;
}

// Country Types
export interface CountryType {
  code: string;
  label: string;
}

// Grid Types
export interface GridColumn {
  field: string;
  headerName: string;
  flex: number;
  minWidth: number;
  filterable: boolean;
  sortable: boolean;
  headerAlign: 'left' | 'center' | 'right';
  type: 'string' | 'number';
  renderCell?: (params: any) => React.ReactNode;
}

// State Types
export interface SearchPageState {
  query: string;
  filters: SearchFilters;
  videos: VideoData[];
  relatedTerms: string[];
  loading: boolean;
  error: string;
  selectedRows: VideoData[];
  extractingEmails: boolean;
  page: number;
  pageSize: number;
  filterModel: GridFilterModel;
  sortModel: GridSortModel;
} 