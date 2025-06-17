import React, { useState, useMemo } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Paper,
    InputAdornment,
    IconButton,
    Tooltip,
    Grid,
    Stack,
} from '@mui/material';
import { 
    DataGrid, 
    GridToolbar,
} from '@mui/x-data-grid';
import type { 
    GridColDef,
    GridFilterModel,
    GridSortModel,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import axios from 'axios';

// Get API base URL from environment variables
const API_URL = "https://youtube-content-discovery-tool-be.onrender.com";
// const API_URL = "http://localhost:8002";

// Helper function to format column header
const formatColumnHeader = (key: string): string => {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper function to format cell value based on type
const formatCellValue = (value: any): string => {
    // Handle undefined, null or empty string
    if (value === undefined || value === null || value === '') {
        return 'N/A';
    }
    
    // Handle different types
    if (typeof value === 'number') {
        return value.toLocaleString();
    }
    
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    
    // Handle string that represents a boolean
    if (value === 'true' || value === 'false') {
        return value === 'true' ? 'Yes' : 'No';
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'N/A';
    }
    
    // Handle YouTube duration format
    if (typeof value === 'string' && value.startsWith('PT')) {
        return value
            .replace('PT', '')
            .replace('H', 'h ')
            .replace('M', 'm ')
            .replace('S', 's');
    }
    
    // Handle date format
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        return new Date(value).toLocaleString();
    }
    
    // Handle URLs in topic categories
    if (typeof value === 'string' && value.startsWith('https://')) {
        return value.split('/').pop() || value;
    }
    
    // For all other strings
    return String(value);
};

// Direct approach to extract fields from the API response
const extractDataFromResponse = (items: any[]): any[] => {
    return items.map((item, index) => {
        // Extract video ID for thumbnail
        const videoId = item.link ? item.link.split('v=')[1]?.split('&')[0] : '';
        
        // Create a copy of the item to avoid modifying the original
        const result: any = { id: index };
        
        // Process all top-level properties
        Object.keys(item).forEach(key => {
            if (key !== 'channel_info') {
                // Handle boolean strings
                if (item[key] === 'true') {
                    result[key] = true;
                } else if (item[key] === 'false') {
                    result[key] = false;
                } else {
                    result[key] = item[key];
                }
            }
        });
        
        // Add thumbnail
        result.thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : 'N/A';
        
        // Process channel_info separately
        if (item.channel_info && typeof item.channel_info === 'object') {
            Object.keys(item.channel_info).forEach(channelKey => {
                const value = item.channel_info[channelKey];
                // Handle boolean strings in channel_info
                if (value === 'true') {
                    result[`channel_${channelKey}`] = true;
                } else if (value === 'false') {
                    result[`channel_${channelKey}`] = false;
                } else {
                    result[`channel_${channelKey}`] = value;
                }
            });
        }
        
        return result;
    });
};

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [videos, setVideos] = useState<any[]>([]);
    const [relatedTerms, setRelatedTerms] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
        quickFilterValues: [],
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);

    // Dynamically generate columns based on the first data item
    const columns = useMemo(() => {
        if (videos.length === 0) return [];

        const firstItem = videos[0];
        console.log("First item for columns:", firstItem);
        
        // Define special column rendering rules
        const specialColumnRenders: { [key: string]: any } = {
            thumbnail: (params: GridRenderCellParams) => (
                <img
                    src={params.value as string}
                    alt="thumbnail"
                    style={{ width: '160px', height: '90px', objectFit: 'cover' }}
                />
            ),
            link: (params: GridRenderCellParams) => (
                <Button
                    href={params.value as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    size="small"
                    startIcon={<YouTubeIcon />}
                    sx={{ '&:hover': { color: 'white' } }}
                >
                    Watch
                </Button>
            ),
            caption_available: (params: GridRenderCellParams) => {
                // Special handler for caption_available
                return typeof params.value === 'boolean' 
                    ? (params.value ? 'Yes' : 'No') 
                    : params.value === 'true' 
                        ? 'Yes' 
                        : params.value === 'false' 
                            ? 'No' 
                            : formatCellValue(params.value);
            },
            licensed_content: (params: GridRenderCellParams) => {
                // Special handler for licensed_content
                return typeof params.value === 'boolean' 
                    ? (params.value ? 'Yes' : 'No') 
                    : params.value === 'true' 
                        ? 'Yes' 
                        : params.value === 'false' 
                            ? 'No' 
                            : formatCellValue(params.value);
            },
            definition: (params: GridRenderCellParams) => {
                // Handle definition field
                return params.value === 'hd' ? 'HD' : params.value === 'sd' ? 'SD' : formatCellValue(params.value);
            }
        };

        const columnWidths: { [key: string]: number } = {
            title: 200,
            email: 200,
            contact_links: 400,
            description: 400,
            tags: 250,
            channel_name: 200,
            duration: 120,
            published_at: 180,
            link: 150,
            thumbnail: 200,
            channel_description: 300,
            channel_custom_url: 180,
            channel_video_count: 160,
            channel_total_views: 160,
            channel_keywords: 250,
            like_count: 150,
            comment_count: 150,
            category_id: 130,
            caption_available: 150,
            definition: 120,
            licensed_content: 150,
            projection: 130
        };

        // Column ordering for better display
        const priorityFields = [
            'id', 'title', "email", "contact_links", "thumbnail", 'channel_name', 'subscriber_count', 'view_count', 
            'like_count', 'comment_count', 'category_id', 'published_at', 'duration', 
            'country', 'definition', 'caption_available', 'licensed_content', 'tags', 'description', 
            'link'
        ];
        
        // Get all keys from the first item
        const allKeys = Object.keys(firstItem);
        
        // Sort keys: first prioritized fields, then the rest alphabetically
        const sortedKeys = [
            ...priorityFields.filter(key => allKeys.includes(key)),
            ...allKeys.filter(key => !priorityFields.includes(key)).sort()
        ];

        console.log("All column keys (sorted):", sortedKeys);

        // Create columns dynamically from the data
        const dynamicColumns: GridColDef[] = sortedKeys.map(key => {
            const baseColumn: GridColDef = {
                field: key,
                headerName: formatColumnHeader(key),
                width: columnWidths[key] || 150,
                // flex: key === 'title' ? 1 : undefined,
                filterable: true,
                sortable: true,
                // Prefer renderCell over valueFormatter for more control
                renderCell: (params: GridRenderCellParams) => {
                    // Handle special fields with custom renderers
                    if (specialColumnRenders[key]) {
                        return specialColumnRenders[key](params);
                    }
                    
                    // Handle boolean values
                    if (typeof params.value === 'boolean') {
                        return params.value ? 'Yes' : 'No';
                    }
                    
                    // Handle string booleans
                    if (params.value === 'true') return 'Yes';
                    if (params.value === 'false') return 'No';
                    
                    // Handle undefined, null or empty values
                    if (params.value === undefined || params.value === null || params.value === '') {
                        return 'N/A';
                    }
                    
                    // For all other values, use the formatCellValue function
                    return formatCellValue(params.value);
                }
            };

            // Special handling for specific fields
            if (key === 'thumbnail') {
                return {
                    ...baseColumn,
                    renderCell: specialColumnRenders.thumbnail,
                    sortable: false,
                    filterable: false,
                };
            }
            
            if (key === 'link') {
                return {
                    ...baseColumn,
                    headerName: 'Watch',
                    renderCell: specialColumnRenders.link,
                    sortable: false,
                    filterable: false,
                };
            }

            // Handle numeric fields
            if ([
                'subscriber_count',
                'view_count',
                'like_count',
                'comment_count',
                'channel_video_count',
                'channel_total_views'
            ].includes(key)) {
                return {
                    ...baseColumn,
                    type: 'number',
                    width: 150,
                    renderCell: (params: GridRenderCellParams) => {
                        if (params.value === undefined || params.value === null) return 'N/A';
                        return Number(params.value).toLocaleString();
                    }
                };
            }

            // Special handling for description fields to limit their size in the grid
            if (key === 'description' || key === 'channel_description') {
                return {
                    ...baseColumn,
                    renderCell: (params: GridRenderCellParams) => {
                        const value = params.value as string;
                        if (!value) return 'N/A';
                        
                        return (
                            <Tooltip title={value}>
                                <Typography variant="body2" noWrap>
                                    {value.substring(0, 100)}
                                    {value.length > 100 ? '...' : ''}
                                </Typography>
                            </Tooltip>
                        );
                    }
                };
            }

            // Special handling for tag arrays
            if (key === 'tags') {
                return {
                    ...baseColumn,
                    renderCell: (params: GridRenderCellParams) => {
                        const tags = params.value as string[];
                        if (!tags || tags.length === 0) return 'N/A';
                        
                        return (
                            <Tooltip title={tags.join(', ')}>
                                <Typography variant="body2" noWrap>
                                    {tags.slice(0, 3).join(', ')}
                                    {tags.length > 3 ? ` +${tags.length - 3} more` : ''}
                                </Typography>
                            </Tooltip>
                        );
                    }
                };
            }

            return baseColumn;
        });

        return dynamicColumns;
    }, [videos]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setVideos([]);
        setRelatedTerms([]);
        setLoading(true);
        setError('');
        setFilterModel({ items: [], quickFilterValues: [] });
        setSortModel([]);

        if (!query.trim()) {
            setError('Please enter a search query');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/search`, {
                query: query.trim()
            });

            console.log("Raw API Response:", response.data);

            if (!response.data) {
                throw new Error('Invalid response from server');
            }

            // Handle dynamic response structure
            const results = Array.isArray(response.data) ? response.data : 
                          response.data.results ? response.data.results : 
                          response.data.data ? response.data.data : [];

            if (results.length === 0) {
                setError('No videos found for your search query.');
                return;
            }

            console.log("Extracted results array:", results);
            console.log("First result item:", results[0]);

            // Process the data using our new approach
            const processedVideos = extractDataFromResponse(results);
            
            console.log("Processed videos:", processedVideos);
            console.log("First processed item:", processedVideos[0]);

            setVideos(processedVideos);
            
            // Handle related terms if they exist in the response
            if (response.data.related_keywords) {
                setRelatedTerms(response.data.related_keywords);
            }
        } catch (err: any) {
            setVideos([]);
            setRelatedTerms([]);
            setError(err.response?.data?.detail || err.message || 'Failed to fetch results. Please try again.');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field: keyof any) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = field === 'country_code' ? e.target.value.toUpperCase() : e.target.value;
        setFilters((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh',
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    px: 2
                }}
            >
                <Box sx={{
                    textAlign: 'center',
                    mb: 4,
                    width: '100%',
                    maxWidth: '800px'
                }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 2
                    }}>
                        <YouTubeIcon sx={{ fontSize: 40, color: 'red' }} />
                        YouTube Content Discovery Tool
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Search for YouTube videos with advanced filtering and get AI-powered related search terms
                    </Typography>
                </Box>

                {/* <Paper elevation={3} sx={{ p: 4, mb: 4, width: '100%', maxWidth: '800px' }}> */}
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3, md: 5 },
                        mb: 4,
                        borderRadius: 2,
                        maxWidth: '800px',
                        mx: 'auto',
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Box
                        component="form"
                        onSubmit={handleSearch}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <Grid container spacing={4}>
                            <Grid {...{ xs: 8 }}>
                                <TextField
                                    fullWidth
                                    label="Search Query"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid {...{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Minimum Views"
                                    value={filters.min_views}
                                    onChange={handleFilterChange('min_views')}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Tooltip title="Minimum view count">
                                                    <IconButton size="small">
                                                        <YouTubeIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid {...{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Minimum Subscribers"
                                    value={filters.min_subscribers}
                                    onChange={handleFilterChange('min_subscribers')}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Tooltip title="Minimum subscriber count">
                                                    <IconButton size="small">
                                                        <PersonIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid {...{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Country Code"
                                    value={filters.country_code}
                                    onChange={handleFilterChange('country_code')}
                                    placeholder="e.g., US"
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Tooltip title="Two-letter country code (e.g., US, GB, IN)">
                                                    <IconButton size="small">
                                                        <PublicIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* <Grid {...{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="sort-by-label">Sort By</InputLabel>
                                    <Select
                                        labelId="sort-by-label"
                                        id="sort-by"
                                        value={filters.sort_by}
                                        label="Sort By"
                                        onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as string })}
                                    >
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}

                            {/* <Grid {...{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="upload-date-label">Upload Date</InputLabel>
                                    <Select
                                        labelId="upload-date-label"
                                        id="upload-date"
                                        value={filters.upload_date}
                                        label="Upload Date"
                                        onChange={(e) => setFilters({ ...filters, upload_date: e.target.value as string })}
                                    >
                                        {uploadDateOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid {...{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="video-duration-label">Video Duration</InputLabel>
                                    <Select
                                        labelId="video-duration-label"
                                        id="video-duration"
                                        value={filters.video_duration}
                                        label="Video Duration"
                                        onChange={(e) => setFilters({ ...filters, video_duration: e.target.value as string })}
                                    >
                                        {videoDurationOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}

                            <Grid {...{ xs: 12 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    size="large"
                                    sx={{ mt: 1 }}
                                    startIcon={
                                        loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />
                                    }
                                >
                                    {loading ? 'Searching...' : 'Search Videos'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                {/* </Paper> */}

                {error && (
                    <Alert severity="error" sx={{ mb: 4, width: '100%', maxWidth: '800px' }}>
                        {error}
                    </Alert>
                )}

                {relatedTerms.length > 0 && (
                    <Paper elevation={2} sx={{ p: 3, mb: 4, width: '100%', maxWidth: '800px' }}>
                        <Typography variant="h6" gutterBottom>
                            Related Search Terms:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {relatedTerms.map((term, index) => (
                                <Chip
                                    key={index}
                                    label={term}
                                    onClick={() => {
                                        setQuery(term);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    clickable
                                    color="primary"
                                    variant="outlined"
                                    sx={{ m: 0.5 }}
                                />
                            ))}
                        </Box>
                    </Paper>
                )}

                {videos.length > 0 && (
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            // height: 600, 
                            width: '100%', 
                            mt: 4,
                            '& .MuiDataGrid-root': {
                                border: 'none',
                            },
                            '& .MuiDataGrid-cell': {
                                padding: '8px',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                fontWeight: 'bold',
                            }
                        }}
                    >
                        <DataGrid
                            rows={videos}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: pageSize,
                                        page: page,
                                    },
                                },
                                columns: {
                                    columnVisibilityModel: {
                                        // Hide some less important columns by default
                                        channel_published_at: false,
                                        channel_default_language: false,
                                        licensed_content: false,
                                        projection: false,
                                        channel_hidden_subscriber_count: false,
                                        caption_available: false,
                                    }
                                }
                            }}
                            pageSizeOptions={[5, 10, 20, 50]}
                            disableRowSelectionOnClick
                            autoHeight
                            pagination
                            onPaginationModelChange={(model) => {
                                setPage(model.page);
                                setPageSize(model.pageSize);
                            }}
                            loading={loading}
                            filterModel={filterModel}
                            onFilterModelChange={setFilterModel}
                            sortModel={sortModel}
                            onSortModelChange={setSortModel}
                            slots={{
                                toolbar: GridToolbar,
                                noRowsOverlay: () => (
                                    <Stack height="100%" alignItems="center" justifyContent="center">
                                        <Typography color="text.secondary">
                                            No videos found. Try adjusting your search terms or filters.
                                        </Typography>
                                    </Stack>
                                ),
                                loadingOverlay: () => (
                                    <Stack height="100%" alignItems="center" justifyContent="center">
                                        <CircularProgress />
                                    </Stack>
                                )
                            }}
                            slotProps={{
                                toolbar: {
                                    showQuickFilter: true,
                                    quickFilterProps: { debounceMs: 500 },
                                    printOptions: { disableToolbarButton: true },
                                    csvOptions: { disableToolbarButton: false },
                                },
                            }}
                            getRowHeight={() => 'auto'}
                            checkboxSelection={false}
                            disableColumnFilter={false}
                            disableColumnSelector={false}
                            disableDensitySelector={false}
                            disableColumnMenu={false}
                            sx={{
                                '& .MuiDataGrid-cell--textLeft': {
                                    whiteSpace: 'normal',
                                    lineHeight: '1.2',
                                    padding: '12px 8px',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: theme => theme.palette.mode === 'light' ? '#f5f5f5' : '#333',
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    overflowX: 'auto'
                                },
                                '& .MuiDataGrid-row': {
                                    width: '100%'
                                }
                            }}
                            density="comfortable"
                        />
                    </Paper>
                )}

                {/* {!loading && !error && videos.length === 0 && query && (
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center', width: '100%', maxWidth: '800px' }}>
                        <Typography variant="h6" color="text.secondary">
                            No videos found. Try adjusting your search terms or filters.
                        </Typography>
                    </Paper>
                )} */}
            </Box>
        </Container>
    );
} 