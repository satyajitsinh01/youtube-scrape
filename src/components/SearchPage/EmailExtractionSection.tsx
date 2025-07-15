import { useMemo } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import type { YouTubeChannel } from './GridTable';

interface EmailExtractionSectionProps {
  selectedRows: YouTubeChannel[];
  extractingEmails: boolean;
  showEmails: boolean;
  onExtractEmails: () => void;
}

export default function EmailExtractionSection({
  selectedRows,
  extractingEmails,
  showEmails,
  onExtractEmails,
}: EmailExtractionSectionProps) {
  // Helper to extract unique emails from selected rows
  const extractedEmails = useMemo(() => {
    const emails = selectedRows
      ?.flatMap((row) => row?.emails || [])
      ?.filter(
        (email) => email && typeof email === "string" && email?.trim() !== ""
      );
    return Array.from(new Set(emails));
  }, [selectedRows]);

  if (selectedRows.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<MarkEmailReadIcon sx={{ fontSize: 24 }} />}
        sx={{
          mb: 2,
          borderRadius: 3,
          fontWeight: 700,
          fontSize: "1.08rem",
          px: 3,
          py: 1.2,
          boxShadow: 2,
          letterSpacing: 0.5,
          textTransform: "none",
          transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
          "&:hover": {
            backgroundColor: (theme) => theme.palette.primary.main + "E6",
            boxShadow: 4,
            transform: "translateY(-0.5px) scale(1.01)",
          },
          outline: 'none !important',
          '&:focus': { outline: 'none !important', boxShadow: 'none !important' },
          '&:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
          '&:active': { outline: 'none !important', boxShadow: 'none !important' },
        }}
        onClick={onExtractEmails}
        disabled={extractingEmails}
      >
        {extractingEmails ? "Extracting..." : "Extract Emails"}
      </Button>
      {showEmails && extractedEmails.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            width: "100%",
            maxWidth: "800px",
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Extracted Emails ({extractedEmails.length}):
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-start",
            }}
          >
            {extractedEmails.map((email, index) => (
              <Chip
                key={index}
                label={email}
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </>
  );
} 