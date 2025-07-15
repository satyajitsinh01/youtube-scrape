import { Box, Typography, Chip, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { StyledPaper } from '../common/StyledComponents';
import type { RelatedTermsProps } from '../../types';

export default function RelatedTermsPanel({ terms, onTermClick }: RelatedTermsProps) {
  return (
    <StyledPaper
      sx={{
        width: { xs: "100%", md: "25%" },
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        height: "100%",
        minHeight: { md: 384, xs: "none" },
        maxHeight: { md: 384, xs: "none" },
        p: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          p: 2,
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid #ececec",
          minHeight: 60,
          maxHeight: 60,
          fontWeight: 700,
          fontSize: "1.1rem",
          letterSpacing: 0.5,
        }}
      >
        <SearchIcon sx={{ color: "white", fontSize: 28 }} />
        Related Search Terms
      </Box>
      {/* Scrollable List */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          background: "#fafbfc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: terms.length > 0 ? "flex-start" : "center",
          minHeight: 0,
          maxHeight: "100%",
          "&::-webkit-scrollbar": {
            width: "8px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#bdbdbd",
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#e0e0e0 #f5f5f5",
        }}
      >
        {terms.length > 0 ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
            }}
          >
            {terms.map((term, index) => (
              <Tooltip title={term} key={index} arrow>
                <Chip
                  label={
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                      }}
                    >
                      {term}
                    </span>
                  }
                  onClick={() => {
                    onTermClick(term);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  clickable
                  color="primary"
                  variant="outlined"
                  sx={{ m: 0.5, minWidth: 120, maxWidth: 180 }}
                />
              </Tooltip>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            No related search terms yet. Try searching for a topic to get
            AI-powered suggestions!
          </Typography>
        )}
      </Box>
    </StyledPaper>
  );
} 