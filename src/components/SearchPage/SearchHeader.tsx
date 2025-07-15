import { Box, Typography, Stack, Avatar } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { StyledPaper } from '../common/StyledComponents';

export default function SearchHeader() {
  return (
    <StyledPaper
      elevation={6}
      sx={{
        mb: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        mx: "auto",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background:
            "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          borderRadius: "50% 0 0 50%",
        }}
      />
      <Box
        sx={{ textAlign: "center", py: 1, position: "relative", zIndex: 1 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={3}
          sx={{ mb: 3 }}
        >
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "white",
              width: 80,
              height: 80,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <YouTubeIcon sx={{ fontSize: 40, color: "red" }} />
          </Avatar>
          <Box textAlign="center">
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              YouTube Content Discovery Tool
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Search for YouTube videos with advanced filtering and get
              AI-powered related search terms
            </Typography>
          </Box>
        </Stack>
        <Typography
          variant="body1"
          sx={{
            opacity: 0.85,
            maxWidth: 600,
            mx: "auto",
            fontSize: "1.1rem",
          }}
        >
          Unlock the power of YouTube analytics with advanced search filters
          and AI-powered insights
        </Typography>
      </Box>
    </StyledPaper>
  );
} 