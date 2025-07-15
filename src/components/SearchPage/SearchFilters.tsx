import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  Checkbox,
  ListItemText,
  MenuItem,
  TextField,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import VideoLibrary from "@mui/icons-material/VideoLibrary";
import CloseIcon from "@mui/icons-material/Close";
import {
  StyledPaper,
  StyledTextField,
  StyledSelect,
} from "../common/StyledComponents";
import { countries } from "../../constants/countries.const";
import type {
  SearchFilters as SearchFiltersType,
  CountryType,
} from "../../types";

interface SearchFiltersProps {
  query: string;
  filters: SearchFiltersType;
  loading: boolean;
  onQueryChange: (query: string) => void;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: (e: React.FormEvent) => void;
}

export default function SearchFilters({
  query,
  filters,
  loading,
  onQueryChange,
  onFiltersChange,
  onSearch,
}: SearchFiltersProps) {
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<CountryType[]>(
    Array.from(countries)
  );
  const [menuDirection, setMenuDirection] = useState<"down" | "up">("down");
  const countrySelectRef = useRef<HTMLDivElement | null>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      [e.target.name]: value,
    });
  };

  const handleCountrySearch = (searchTerm: string) => {
    setCountrySearchTerm(searchTerm);
    if (searchTerm.trim() === "") {
      setFilteredCountries(Array.from(countries));
    } else {
      const filtered = countries.filter(
        (country) =>
          country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(Array.from(filtered));
    }
  };

  const handleClearAllCountries = () => {
    onFiltersChange({
      ...filters,
      country_code: "",
    });
  };

  const handleRemoveCountry = (countryCode: string) => {
    const currentSelected = filters.country_code
      ? filters.country_code.split(",").filter(Boolean)
      : [];
    const newSelected = currentSelected.filter(
      (item: string) => item !== countryCode
    );
    onFiltersChange({
      ...filters,
      country_code: newSelected.join(","),
    });
  };

  const handleCountryMenuOpen = () => {
    setIsCountryMenuOpen(true);
    setFilteredCountries(Array.from(countries));
    setTimeout(() => {
      if (countrySelectRef.current) {
        const rect = countrySelectRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 320 && spaceAbove > spaceBelow) {
          setMenuDirection("up");
        } else {
          setMenuDirection("down");
        }
      }
    }, 0);
  };

  const handleCountryMenuClose = () => {
    setIsCountryMenuOpen(false);
    setCountrySearchTerm("");
    setFilteredCountries(Array.from(countries));
  };

  return (
    <StyledPaper
      elevation={6}
      sx={{ width: { xs: "100%", md: "75%" }, mb: { xs: 2, md: 0 } }}
    >
      <Box
        component="form"
        onSubmit={onSearch}
        sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
      >
        {/* Main Search Query */}
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 400,
              color: "text.primary",
              mb: 1,
              fontSize: "0.875rem",
            }}
          >
            Search Query <span style={{ color: "red" }}>*</span>
          </Typography>
          <StyledTextField
            name="query"
            fullWidth
            value={query}
            autoComplete="off"
            onChange={(e) => onQueryChange(e.target.value)}
            required
            placeholder="Enter your search query..."
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 56,
                fontSize: "1.1rem",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" sx={{ fontSize: 24 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Filters Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            width: "100%",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 400,
                color: "text.primary",
                mb: 1,
                fontSize: "0.875rem",
              }}
            >
              Minimum Views
            </Typography>
            <StyledTextField
              fullWidth
              type="number"
              name="min_views"
              value={filters.min_views || ""}
              onChange={handleFilterChange}
              placeholder="0"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton size="small" sx={{ color: "action.active" }}>
                      <YouTubeIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 400,
                color: "text.primary",
                mb: 1,
                fontSize: "0.875rem",
              }}
            >
              Minimum Subscribers
            </Typography>
            <StyledTextField
              fullWidth
              name="min_subscribers"
              type="number"
              value={filters.min_subscribers || ""}
              onChange={handleFilterChange}
              placeholder="0"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton size="small" sx={{ color: "action.active" }}>
                      <PersonIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 400,
                color: "text.primary",
                mb: 1,
                fontSize: "0.875rem",
              }}
            >
              Channel Limit <span style={{ color: "red" }}>*</span>
            </Typography>
            <StyledTextField
              fullWidth
              type="number"
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton size="small" sx={{ color: "action.active" }}>
                      <VideoLibrary />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 1, max: 200 }}
            />
          </Box>
        </Box>

        {/* Country Code Filter */}
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 400,
              color: "text.primary",
              mb: 1,
              fontSize: "0.875rem",
            }}
          >
            Choose Country Codes
          </Typography>
          <FormControl fullWidth ref={countrySelectRef}>
            <StyledSelect
              id="country-select"
              multiple
              open={isCountryMenuOpen}
              onOpen={handleCountryMenuOpen}
              onClose={handleCountryMenuClose}
              value={
                filters?.country_code
                  ? filters?.country_code.split(",").filter(Boolean)
                  : []
              }
              onChange={(e) => {
                const selectedCodes = e.target.value as string[];
                onFiltersChange({
                  ...filters,
                  country_code: selectedCodes.join(","),
                });
              }}
              renderValue={(selected) => {
                const selectedArray = selected as string[];
                return (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      maxHeight: 55,
                      overflowY: "auto",
                      padding: "2px 0",
                      "&::-webkit-scrollbar": { width: "4px" },
                      "&::-webkit-scrollbar-thumb": {
                        background: (theme) =>
                          theme.palette.mode === "light"
                            ? "#cbd5e1"
                            : "#475569",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    {selectedArray.map((value) => {
                      const country = countries.find((c) => c.code === value);
                      return (
                        <Chip
                          key={value}
                          label={country ? country.label : value}
                          size="small"
                          sx={{
                            fontSize: "0.75rem",
                            backgroundColor: (theme) =>
                              theme.palette.primary.main,
                            color: "white",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                theme.palette.primary.main,
                            },
                            "& .MuiChip-deleteIcon": {
                              color: "white",
                              "&:hover": { color: "#fecaca" },
                            },
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDelete={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveCountry(value);
                          }}
                          deleteIcon={
                            <CloseIcon sx={{ fontSize: "0.875rem" }} />
                          }
                        />
                      );
                    })}

                    {selectedArray.length > 0 && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleClearAllCountries();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{
                          color: (theme) => theme.palette.primary.main,
                          backgroundColor: "transparent",
                          border: 0.5,
                          borderColor: "gray",
                          position: "absolute",
                          right: 40,
                          transform: "translateY(-50%)",
                          top: "50%",
                          width: 24,
                          height: 24,
                          ml: 1,
                          "&:hover": {
                            backgroundColor: (theme) => theme.palette.grey[100],
                            color: "red",
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: "0.875rem" }} />
                      </IconButton>
                    )}
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 310,
                    minHeight: 200,
                    borderRadius: 0.3,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                    mt: menuDirection === "down" ? 2 : 0,
                    mb: menuDirection === "up" ? 2 : 0,
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      backgroundColor: "#f1f1f1",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#bdbdbd",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: "#888",
                    },
                    scrollbarWidth: "thin",
                    scrollbarColor: "#bdbdbd #f1f1f1",
                  },
                },
                anchorOrigin: {
                  vertical: menuDirection === "down" ? "bottom" : "top",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: menuDirection === "down" ? "top" : "bottom",
                  horizontal: "left",
                },
              }}
              startAdornment={
                <InputAdornment position="start">
                  <PublicIcon color="action" sx={{ fontSize: 20 }} />
                </InputAdornment>
              }
            >
              {/* Search Input */}
              <Box
                sx={{
                  p: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                  position: "sticky",
                  top: 0,
                  backgroundColor: "background.paper",
                  zIndex: 1,
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search countries..."
                  fullWidth
                  variant="outlined"
                  value={countrySearchTerm}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      fontSize: "0.875rem",
                    },
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCountrySearch(e.target.value);
                  }}
                />
              </Box>
              {/* Country Options */}
              {filteredCountries.map((country) => (
                <MenuItem
                  key={country?.code}
                  value={country?.code}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={
                      filters?.country_code
                        ? filters?.country_code
                            ?.split(",")
                            ?.filter(Boolean)
                            ?.includes(country?.code)
                        : false
                    }
                  />
                  <ListItemText
                    primary={`${country?.code} (${country?.label})`}
                    primaryTypographyProps={{ fontSize: "0.875rem" }}
                  />
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
        </Box>

        {/* Search Button */}
        <Box sx={{ width: "100%", mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading || !query.trim() || filters?.limit < 1}
            size="large"
            sx={{
              height: 48,
              fontSize: "1.1rem",
              fontWeight: 400,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: 3,
              outline: "none !important",
              "&:focus": {
                outline: "none !important",
                boxShadow: "none !important",
              },
              "&:focus-visible": {
                outline: "none !important",
                boxShadow: "none !important",
              },
              "&:active": {
                outline: "none !important",
                boxShadow: "none !important",
              },
              "&:hover": {
                backgroundColor: (theme) => theme.palette.primary.main + "E6",
                boxShadow: 6,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
            startIcon={
              loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SearchIcon sx={{ fontSize: 24 }} />
              )
            }
          >
            {loading ? "Searching..." : "Search Videos"}
          </Button>
        </Box>
      </Box>
    </StyledPaper>
  );
}
