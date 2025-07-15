import { styled } from '@mui/material/styles';
import { Paper, TextField, Select } from '@mui/material';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  width: "100%",
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 4px 20px rgba(0,0,0,0.08)"
      : "0 4px 20px rgba(255,255,255,0.08)",
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.mode === "light" ? "#f8fafc" : "#1e293b",
    border: `1px solid ${
      theme.palette.mode === "light" ? "#e2e8f0" : "#334155"
    }`,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: theme.palette.mode === "light" ? "#cbd5e1" : "#475569",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      transform: "translateY(-1px)",
    },
    "&.Mui-focused:not(:hover)": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      transform: "translateY(-1px)",
    },
    "&:not(.Mui-focused):not(:hover)": {
      borderColor: theme.palette.mode === "light" ? "#e2e8f0" : "#334155",
      borderWidth: "1px",
      boxShadow: "none",
      transform: "translateY(0)",
    },
    "& fieldset": {
      border: "none",
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.mode === "light" ? "#64748b" : "#94a3b8",
    fontWeight: 400,
    fontSize: "0.875rem",
    marginBottom: theme.spacing(1),
    "&.Mui-focused": {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
  },
  "& .MuiInputBase-input": {
    color: theme.palette.mode === "light" ? "#1e293b" : "#f1f5f9",
    fontWeight: 500,
    "&::placeholder": {
      color: theme.palette.mode === "light" ? "#94a3b8" : "#64748b",
      opacity: 1,
    },
  },
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.mode === "light" ? "#f8fafc" : "#1e293b",
    border: `1px solid ${
      theme.palette.mode === "light" ? "#e2e8f0" : "#334155"
    }`,
    transition: "all 0.2s ease-in-out",
    minHeight: 56, // match StyledTextField height
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.mode === "light" ? "#f1f5f9" : "#334155",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-1px)",
    },
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      transform: "translateY(-1px)",
    },
    "&.Mui-focused:not(:hover)": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      transform: "translateY(-1px)",
    },
    "&:not(.Mui-focused):not(:hover)": {
      borderColor: theme.palette.mode === "light" ? "#e2e8f0" : "#334155",
      borderWidth: "1px",
      boxShadow: "none",
      transform: "translateY(0)",
    },
    "& fieldset": {
      border: "none",
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.mode === "light" ? "#64748b" : "#94a3b8",
    fontWeight: 400,
    fontSize: "0.875rem",
    marginBottom: theme.spacing(1),
    "&.Mui-focused": {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
  },
  "& .MuiSelect-select": {
    color: theme.palette.mode === "light" ? "#1e293b" : "#f1f5f9",
    fontWeight: 500,
    padding: "10px 10px",
    minHeight: "auto",
  },
}));