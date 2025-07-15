import React, { useState } from "react";
import { Box, Alert } from "@mui/material";
import axios from "axios";
import SearchHeader from "./SearchHeader";
import SearchFilters from "./SearchFilters";
import RelatedTermsPanel from "./RelatedTermsPanel";
import VideoResultsTable from "./VideoResultsTable";
import EmailExtractionSection from "./EmailExtractionSection";
import { extractDataFromResponse } from "../../utils/common";
import { API_URL } from "../../constants/api.const";
import type { 
  VideoData, 
  SearchFilters as SearchFiltersType, 
  GridFilterModel, 
  GridSortModel 
} from "../../types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFiltersType>({
    limit: 10,
  });
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [relatedTerms, setRelatedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [selectedRows, setSelectedRows] = useState<VideoData[]>([]);
  const [extractingEmails, setExtractingEmails] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideos([]);
    setSelectedRows([]);
    setRelatedTerms([]);
    setLoading(true);
    setError("");
    setFilterModel({ items: [], quickFilterValues: [] });
    setSortModel([]);

    if (!query.trim()) {
      setError("Please enter a search query");
      setLoading(false);
      return;
    }
    if (!filters.limit || filters.limit < 1) {
      setError("Channel limit must be at least 1");
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, any> = {
        query: query.trim(),
        ...filters,
        limit: Number(filters.limit),
      };
      const numericKeys = ["min_views", "min_subscribers"];
      numericKeys.forEach((key) => {
        const value = payload[key];
        if (value !== undefined && value !== null && !isNaN(value)) {
          payload[key] = Number(value);
        }
      });
      
      const response = await axios.post(`${API_URL}/search`, payload);

      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      // Handle dynamic response structure
      const results = Array.isArray(response.data)
        ? response.data
        : response.data.results
        ? response.data.results
        : response.data.data
        ? response.data.data
        : [];

      if (results.length === 0) {
        setError("No videos found for your search query.");
        return;
      }

      // Process the data using our new approach
      const processedVideos = extractDataFromResponse(results);
      setVideos(processedVideos);

      // Handle related terms if they exist in the response
      if (response.data.related_keywords) {
        setRelatedTerms(response.data.related_keywords);
      }
    } catch (err: any) {
      setVideos([]);
      setRelatedTerms([]);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to fetch results. Please try again."
      );
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractEmails = async () => {
    if (!selectedRows.length) return;
    setExtractingEmails(true);
    setError("");

    try {
      const video_urls = selectedRows
        .filter((row) => row?.channel_url)
        .map((row) => {
          return {
            id: row?.id,
            url: row?.channel_url,
          };
        });

      const payload = { video_urls };
      const response = await axios.post(`${API_URL}/extract-emails`, payload);
      const emailResults = response.data;

      // Handle FastAPI validation errors
      if (
        Array.isArray(emailResults) &&
        emailResults.length > 0 &&
        emailResults[0]?.msg &&
        emailResults[0]?.loc
      ) {
        setError("Invalid input for email extraction.");
        setExtractingEmails(false);
        return;
      }

      // Update videos state
      setVideos((prevVideos) =>
        prevVideos.map((video) => {
          const match = emailResults.find(
            (res: any) => res.video_url?.id === video?.id
          );
          if (match) {
            return {
              ...video,
              primary_email: match?.email || video?.email,
              links: match?.links || video?.links,
            };
          }
          return video;
        })
      );

      // Update selected rows
      setSelectedRows((prevSelected: VideoData[]) =>
        prevSelected.map((row) => {
          const match = emailResults.find(
            (res: any) => res.video_url?.url === row.channel_url
          );
          if (match) {
            return {
              ...row,
              email: match.email || row.email,
              links: match.links || row.links,
            };
          }
          return row;
        })
      );
    } catch (error: any) {
      setError("Failed to extract emails. Please try again.");
    } finally {
      setExtractingEmails(false);
    }
  };

  const handleTermClick = (term: string) => {
    setQuery(term);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "background.default",
        width: "98vw",
        maxWidth: "1800px",
        mx: "auto",
        px: { xs: 2, sm: 4 },
        mt: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Header */}
        <SearchHeader />

        {/* Search Form and Related Terms */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            width: "100%",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "flex-start" },
          }}
        >
          <SearchFilters
            query={query}
            filters={filters}
            loading={loading}
            onQueryChange={setQuery}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
          />
          <RelatedTermsPanel terms={relatedTerms} onTermClick={handleTermClick} />
        </Box>

        {/* Error Message */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 1, mt: 4, width: "100%", maxWidth: "800px" }}
          >
            {error}
          </Alert>
        )}

        {/* Video Results Table */}
        {videos.length > 0 && (
          <VideoResultsTable
            videos={videos}
            loading={loading}
            selectedRows={selectedRows}
            onRowSelectionChange={(rows) => setSelectedRows(rows)}
            onExtractEmails={handleExtractEmails}
            extractingEmails={extractingEmails}
            page={page}
            pageSize={pageSize}
            filterModel={filterModel}
            sortModel={sortModel}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            onFilterModelChange={(model) => setFilterModel(model)}
            onSortModelChange={(model) => setSortModel(model)}
          />
        )}

        {/* Email Extraction Section */}
        <EmailExtractionSection
          selectedRows={selectedRows}
          extractingEmails={extractingEmails}
          showEmails={false}
          onExtractEmails={handleExtractEmails}
        />

      </Box>
    </Box>
  );
}
