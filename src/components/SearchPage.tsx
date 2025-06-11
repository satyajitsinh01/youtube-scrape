import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Paper,
    InputAdornment,
    IconButton,
    Tooltip,
    Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import axios from 'axios';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<any>({
        min_views: 0,
        min_subscribers: 0,
        country_code: ''
    });

    const [videos, setVideos] = useState<any[]>([]);
    const [relatedTerms, setRelatedTerms] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');



    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        // Clear previous results immediately when starting a new search
        setVideos([]);
        setRelatedTerms([]);
        setLoading(true);
        setError('');

        if (!query.trim()) {
            setError('Please enter a search query');
            setLoading(false);
            return;
        }

        try {
            const API_BASE_URL = 'http://localhost:8002';
            const response = await axios.post<{
                results: Array<{
                    title: string;
                    link: string;
                    channel_name: string;
                    subscriber_count: number;
                    view_count: number;
                    country?: string;
                }>;
                related_keywords: string[];
            }>(`${API_BASE_URL}/search`, {
                query: query.trim(),
                // Only include filters if they have non-zero/non-empty values
                ...(filters.min_views > 0 && { min_views: filters.min_views }),
                ...(filters.min_subscribers > 0 && { min_subscribers: filters.min_subscribers }),
                ...(filters.country_code && { country_code: filters.country_code })
            });

            if (!response.data || !response.data.results) {
                throw new Error('Invalid response from server');
            }

            // Transform the response data to match your frontend structure
            const transformedVideos = response.data.results.map(video => ({
                id: video.link, // Using link as ID since it should be unique
                title: video.title,
                url: video.link,
                channelTitle: video.channel_name,
                subscriberCount: video.subscriber_count,
                viewCount: video.view_count,
                thumbnail: `https://i.ytimg.com/vi/${video.link.split('v=')[1]}/mqdefault.jpg` // Generate thumbnail URL from video link
            }));

            setVideos(transformedVideos);
            setRelatedTerms(response.data.related_keywords || []);
        } catch (err: any) {
            setVideos([]); // Ensure videos are cleared on error
            setRelatedTerms([]); // Ensure related terms are cleared on error
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
                            <Grid item xs={8}>
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

                            <Grid item xs={12} sm={4}>
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

                            <Grid item xs={12} sm={4}>
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

                            <Grid item xs={12} sm={4}>
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

                            <Grid item xs={12}>
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
                    <Grid container spacing={3} justifyContent="center">
                        {videos.map((video) => (
                            <Grid item xs={12} sm={6} md={4} key={video.id} sx={{ display: 'flex' }}>
                                <Card
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: 380,       // Fixed height for all cards
                                        maxWidth: 345,     // Fixed width for all cards
                                        minWidth: 345,
                                        width: '100%',
                                        mx: 'auto',
                                    }}
                                    elevation={3}
                                >
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={video.thumbnail}
                                        alt={video.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography gutterBottom variant="h6" component="div" noWrap>
                                            {video.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {video.channelTitle}
                                        </Typography>
                                        <Box sx={{ mt: 'auto' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                👁️ {video.viewCount.toLocaleString()} views
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                👥 {video.subscriberCount.toLocaleString()} subscribers
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <Button
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="contained"
                                        size="small"
                                        startIcon={<YouTubeIcon />}
                                        sx={{ p: 1, width: '40%', borderRadius: 2, m: 2, '&:hover': { color: 'white' } }}

                                    >
                                        Watch Video
                                    </Button>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                )}

                {!loading && !error && videos.length === 0 && query && (
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center', width: '100%', maxWidth: '800px' }}>
                        <Typography variant="h6" color="text.secondary">
                            No videos found. Try adjusting your search terms or filters.
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Container>
    );
} 