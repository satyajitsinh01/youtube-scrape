import React from "react";
import type {
  Column,
  ColumnDef,
  ExpandedState,
  PaginationState,
  Row,
  Table,
} from "@tanstack/react-table";
import { formatCellValue, formatColumnHeader } from "../../utils/table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  TableContainer,
  IconButton,
  Tooltip,
  Checkbox,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import type { TypographyProps } from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { StyledTextField } from "../common/StyledComponents";
import { FilterAltOff, FilterAlt } from "@mui/icons-material";
import TableChartIcon from "@mui/icons-material/TableChart";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import Popover from '@mui/material/Popover';
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

// Dummy data generator and type
export type YouTubeChannel = {
  id: string;
  channel_name: string;
  subscriber_count: number;
  country: string;
  about: string;
  links: string[];
  emails: string[];
  last_3_videos: {
    title: string;
    description: string;
    view_count: number;
  }[];
  average_views: number;
  channel_url: string;
  is_icp: boolean;
};

// Accept data as a prop
interface TanstackTableDemoProps {
  data: YouTubeChannel[];
  onRowSelectionChange?: (rows: YouTubeChannel[]) => void;
}

const GridTable: React.FC<TanstackTableDemoProps> = ({ data, onRowSelectionChange }) => {
  // Selection state
  const [selectedRowIds, setSelectedRowIds] = React.useState<{
    [id: string]: boolean;
  }>({});
  const allSelected =
    data.length > 0 && data.every((row) => selectedRowIds[row.id]);
  const someSelected =
    data.some((row) => selectedRowIds[row.id]) && !allSelected;

  // Add filter visibility state
  const [showFilters, setShowFilters] = React.useState(false);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = React.useState<{
    [key: string]: boolean;
  }>({ channel_url: false });
  const [showColumnPopover, setShowColumnPopover] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Dynamically generate columns based on the first data item, but exclude 'last_3_videos'
  const columns = React.useMemo<ColumnDef<YouTubeChannel>[]>(() => {
    if (data.length === 0) return [];
    const firstItem = data[0];
    // Special renderers for certain fields
    const specialRenderers: {
      [key: string]: (value: unknown, row: YouTubeChannel) => React.ReactNode;
    } = {
      links: (value: unknown) => {
        const links = value as string[];
        if (!links || links.length === 0) return "N/A";
        const display = links.join(", ");
        return (
          <Tooltip title={display} arrow placement="top">
            <Typography
              variant="body2"
              noWrap
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
                display: "block",
              }}
            >
              {display}
            </Typography>
          </Tooltip>
        );
      },
    };
    // Get all keys from the first item, but filter out 'last_3_videos'
    const allKeys = Object.keys(firstItem).filter(
      (key) => key !== "last_3_videos"
    );
    // Add expander as the second column (after checkbox)
    const expanderColumn: ColumnDef<YouTubeChannel> = {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <span
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: "pointer" },
          }}
        >
          {row.getIsExpanded() ? "🔽" : "▶️"}
        </span>
      ),
    };
    // Checkbox column as the first column
    const checkboxColumn: ColumnDef<YouTubeChannel> = {
      id: "select",
      header: () => (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => {
            const checked = e.target.checked;
            const newSelected: { [id: string]: boolean } = {};
            if (checked) {
              data.forEach((row) => {
                newSelected[row.id] = true;
              });
            }
            setSelectedRowIds(checked ? newSelected : {});
          }}
          inputProps={{ "aria-label": "select all" }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={!!selectedRowIds[row.original.id]}
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedRowIds((prev) => ({
              ...prev,
              [row.original.id]: checked,
            }));
          }}
          inputProps={{ "aria-label": "select row" }}
        />
      ),
      size: 40,
      meta: { align: "center" },
      enableSorting: false,
      enableColumnFilter: false,
    };
    return [
      checkboxColumn,
      expanderColumn,
      ...allKeys.map((key) => ({
        accessorKey: key,
        header: () => <span>{formatColumnHeader(key)}</span>,
        cell: (info: {
          getValue: () => unknown;
          row: { original: YouTubeChannel };
        }) =>
          specialRenderers[key]
            ? specialRenderers[key](info.getValue(), info.row.original)
            : (() => {
                const value = info.getValue();
                if (typeof value === "boolean") return value ? "Yes" : "No";
                if (value === "true") return "Yes";
                if (value === "false") return "No";
                if (value === undefined || value === null || value === "") {
                  return (
                    <Typography variant="body2" noWrap>
                      N/A
                    </Typography>
                  );
                }
                const valueStr = formatCellValue(value);
                return (
                  <Tooltip title={valueStr} arrow placement="top">
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                        display: "block",
                      }}
                    >
                      {valueStr}
                    </Typography>
                  </Tooltip>
                );
              })(),
        footer: (props: { column: { id: string } }) => props.column.id,
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          align: "center",
        },
      })),
    ];
  }, [data, selectedRowIds, allSelected, someSelected]);

  // Notify parent when selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = data.filter((row) => selectedRowIds[row.id]);
      onRowSelectionChange(selectedRows);
    }
  }, [selectedRowIds, data, onRowSelectionChange]);

  return (
    <>
      <MyTable
        data={data}
        columns={columns}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        showColumnPopover={showColumnPopover}
        setShowColumnPopover={setShowColumnPopover}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
      />
    </>
  );
};

function MyTable({
  data,
  columns,
  showFilters,
  setShowFilters,
  columnVisibility,
  setColumnVisibility,
  showColumnPopover,
  setShowColumnPopover,
  anchorEl,
  setAnchorEl,
}: {
  data: YouTubeChannel[];
  columns: ColumnDef<YouTubeChannel>[];
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  columnVisibility: { [key: string]: boolean };
  setColumnVisibility: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  showColumnPopover: boolean;
  setShowColumnPopover: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: null | HTMLElement;
  setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
}) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // No subRows for this data
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    state: {
      pagination,
      expanded,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true, // <-- Make every row expandable
  });

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        mb: 4,
        mt: 1.5,
        borderRadius: 0.5,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)",
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {/* Table Title */}
      <Box
        sx={{
          width: "100%",
          py: 1,
          px: 3,
          background: "#f5f8ff",
          color: "#22223b",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px 0 rgba(102,126,234,0.08)",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          minHeight: 40,
        }}
      >
        {/* Left: Title with Icon */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <TableChartIcon sx={{ fontSize: 32, color: "#667eea" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: 0.5, color: "#22223b" }}
          >
            YouTube Channels
          </Typography>
        </Box>
        {/* Right: Filter Toggle and Column Visibility Toggle */}
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
            <IconButton
              onClick={() => setShowFilters((prev) => !prev)}
              sx={{
                ml: 2,
                color: showFilters ? "#fff" : "#667eea",
                background: showFilters ? "#667eea" : "#e0e7ff",
                borderRadius: 2,
                boxShadow: "none",
                '&:hover': {
                  background: showFilters ? "#5a67d8" : "#c7d2fe",
                },
                outline: "none !important",
              }}
              size="medium"
            >
              {showFilters ? <FilterAlt /> : <FilterAltOff />}
            </IconButton>
          </Tooltip>
         <Tooltip title="Show/Hide Columns">
           <IconButton
             onClick={(e) => {
               setShowColumnPopover(true);
               setAnchorEl(e.currentTarget);
             }}
             sx={{
               ml: 1,
               color: showColumnPopover ? "#fff" : "#667eea",
               background: showColumnPopover ? "#667eea" : "#e0e7ff",
               borderRadius: 2,
               boxShadow: "none",
               '&:hover': {
                 background: showColumnPopover ? "#5a67d8" : "#c7d2fe",
               },
               outline: "none !important",
             }}
             size="medium"
           >
             <ViewColumnIcon />
           </IconButton>
         </Tooltip>
         <Popover
           open={showColumnPopover}
           anchorEl={anchorEl}
           onClose={() => setShowColumnPopover(false)}
           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
           transformOrigin={{ vertical: 'top', horizontal: 'right' }}
           PaperProps={{
             sx: { p: 2, minWidth: 220, maxWidth: 300 },
           }}
         >
           <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
             Show/Hide Columns
           </Typography>
           <Box display="flex" flexDirection="column" gap={0.5}>
             <Box>
               <Checkbox
                 checked={table.getIsAllColumnsVisible()}
                 indeterminate={table.getIsSomeColumnsVisible() && !table.getIsAllColumnsVisible()}
                 onChange={table.getToggleAllColumnsVisibilityHandler()}
                 size="small"
               />
               <Typography variant="body2" component="span">
                 Toggle All
               </Typography>
             </Box>
             {table.getAllLeafColumns().map((column) => (
               <Box key={column.id} display="flex" alignItems="center">
                 <Checkbox
                   checked={column.getIsVisible()}
                   disabled={!column.getCanHide()}
                   onChange={column.getToggleVisibilityHandler()}
                   size="small"
                 />
                 <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                   {typeof column.columnDef.header === 'function'
                     ? column.id
                     : column.columnDef.header || column.id}
                 </Typography>
               </Box>
             ))}
           </Box>
         </Popover>
        </Box>
      </Box>
      <TableContainer>
        <MuiTable
          sx={{
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont",
            background: "#fff",
            border: "none",
            borderRadius: 0.5,
            "& .MuiTableCell-head": {
              background: "#f5f8ff",
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1rem",
              borderBottom: "1px solid #e5e7eb",
              letterSpacing: 0,
              minHeight: 40,
              height: 40,
              maxHeight: 40,
              textAlign: "center",
              zIndex: 3,
            },
            "& .MuiTableCell-root": {
              color: "#1e293b",
              fontSize: "0.98rem",
              padding: "8px 10px",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxHeight: 40,
              minHeight: 40,
              height: 40,
              textAlign: "center",
            },
            "& .MuiTableRow-root:hover": {
              backgroundColor: "#f3f6fa",
            },
            "& .Mui-selected, & .Mui-selected:hover": {
              backgroundColor: "#e0e7ff",
            },
            "& .MuiTableRow-root:nth-of-type(even)": {
              backgroundColor: "#f7fafd",
            },
          }}
        >
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background: "#f5f8ff",
                  boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                }}
              >
                {headerGroup.headers.map((header, idx) => (
                  <TableCell
                    key={header.id}
                    colSpan={header.colSpan}
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      textAlign: "center",
                      background: "#f5f8ff",
                      borderRight:
                        idx !== headerGroup.headers.length - 1
                          ? "1px solid #e5e7eb"
                          : undefined,
                      padding: header.id === "select" ? "0 8px" : undefined,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: header.column.getCanSort()
                          ? "pointer"
                          : "default",
                        gap: 0.5,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && (
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#e0e7ff",
                            boxShadow: header.column.getIsSorted()
                              ? "0 2px 8px 0 rgba(102,126,234,0.15)"
                              : "none",
                            ml: 0.5,
                            mt: 0.5,
                          }}
                        >
                          <ArrowDropUpIcon
                            fontSize="large"
                            sx={{
                              color: "#667eea",
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#e0e7ff",
                            boxShadow: header.column.getIsSorted()
                              ? "0 2px 8px 0 rgba(102,126,234,0.15)"
                              : "none",
                            ml: 0.5,
                            mt: 0.5,
                          }}
                        >
                          <ArrowDropDownIcon
                            fontSize="large"
                            sx={{
                              color: "#667eea",
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                    {header.column.getCanFilter() && showFilters ? (
                      <Box mt={1}>
                        <Filter column={header.column} table={table} />
                      </Box>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  align="center"
                  sx={{ py: 6, fontSize: "1.2rem", color: "#888" }}
                >
                  No data to display
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    sx={{
                      "&:hover": { backgroundColor: "#e8eafc" },
                      borderLeft: row.getIsExpanded()
                        ? "4px solid #667eea"
                        : undefined,
                      transition: "border 0.2s, background 0.2s",
                    }}
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <TableCell
                        key={cell.id}
                        sx={{
                          padding:
                            cell.column.id === "select" ? "0 8px" : "10px 14px",
                          fontSize: "1rem",
                          borderRight:
                            idx !== row.getVisibleCells().length - 1
                              ? "1px solid #e5e7eb"
                              : undefined,
                        }}
                      >
                        {cell.column.id === "expander" ? (
                          row.getCanExpand() ? (
                            <IconButton
                              size="small"
                              onClick={row.getToggleExpandedHandler()}
                              sx={{
                                outline: "none !important",
                                background: row.getIsExpanded()
                                  ? "#e0e7ff"
                                  : undefined,
                                borderRadius: "50%",
                                transition: "background 0.2s",
                                "&:hover": { background: "#c7d2fe" },
                              }}
                            >
                              {row.getIsExpanded() ? (
                                <ExpandMoreIcon />
                              ) : (
                                <ChevronRightIcon />
                              )}
                            </IconButton>
                          ) : null
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        sx={{
                          background: "#f3f4f6",
                          p: 2,
                          borderLeft: "4px solid #667eea",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <ExpandedRowContent row={row} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <Paper
        elevation={0}
        sx={{
          mt: 0,
          mb: 0,
          px: 2,
          py: 1.5,
          borderRadius: "0 0 8px 8px",
          background: "#fafbfc",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 56,
        }}
      >
        {/* Left: Page size Autocomplete dropdown */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#64748b",
              mr: 1,
              minWidth: 90,
            }}
            id="rows-per-page-label"
          >
            Rows per page:
          </Typography>
          <Autocomplete
            options={[10, 20, 30, 40, 50]}
            value={table.getState().pagination.pageSize}
            onChange={(_, newValue) => {
              if (typeof newValue === "number") table.setPageSize(newValue);
            }}
            disableClearable
            size="small"
            sx={{
              minWidth: 120,
              background: "#fff",
              borderRadius: 2,
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
              "& .MuiOutlinedInput-root": {
                fontWeight: 500,
                fontSize: "1rem",
                minHeight: 40,
                paddingRight: "32px",
                outline: "none !important",
                boxShadow: "none !important",
                "&.Mui-focused": {
                  outline: "none !important",
                  boxShadow: "none !important",
                },
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
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #e5e7eb",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select"
                variant="outlined"
                size="small"
                aria-labelledby="rows-per-page-label"
                sx={{
                  background: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    outline: "none !important",
                    boxShadow: "none !important",
                  },
                  "& .MuiOutlinedInput-input": {
                    outline: "none !important",
                    boxShadow: "none !important",
                  },
                  "& .Mui-focused": {
                    outline: "none !important",
                    boxShadow: "none !important",
                  },
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
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: null,
                  sx: {
                    outline: "none !important",
                    boxShadow: "none !important",
                    "&.Mui-focused": {
                      outline: "none !important",
                      boxShadow: "none !important",
                    },
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
                  },
                }}
              />
            )}
            getOptionLabel={(option) => `${option}`}
            isOptionEqualToValue={(option, value) => option === value}
          />
        </Box>

        {/* Center: Modern Pagination Controls with Prev/Next between page numbers */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ justifyContent: "center", flex: 1 }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.setPageIndex(0)}
            disabled={table.getState().pagination.pageIndex === 0}
            sx={(theme) => ({
              borderRadius: "50%",
              minWidth: 36,
              height: 36,
              fontWeight: 700,
              color: theme.palette.text.primary,
              background: theme.palette.grey[100],
              border: "1px solid",
              borderColor: theme.palette.grey[200],
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
              mx: 0.5,
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
              "&:hover": { background: theme.palette.grey[200] },
              "&.Mui-disabled": {
                background: theme.palette.grey[200],
                color: theme.palette.grey[400],
                borderColor: theme.palette.grey[200],
              },
            })}
            aria-label="First Page"
          >
            <FirstPageIcon sx={{ fontSize: 18 }} />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            sx={(theme) => ({
              borderRadius: "50%",
              minWidth: 36,
              height: 36,
              fontWeight: 700,
              color: theme.palette.text.primary,
              background: theme.palette.grey[100],
              border: "1px solid",
              borderColor: theme.palette.grey[200],
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
              mx: 0.5,
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
              "&:hover": { background: theme.palette.grey[200] },
              "&.Mui-disabled": {
                background: theme.palette.grey[200],
                color: theme.palette.grey[400],
                borderColor: theme.palette.grey[200],
              },
            })}
            aria-label="Previous Page"
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
          </Button>
          {getPaginationRange(
            table.getState().pagination.pageIndex,
            table.getPageCount()
          ).map((item, idx) =>
            typeof item === "number" ? (
              <Button
                key={item}
                variant={
                  item === table.getState().pagination.pageIndex + 1
                    ? "contained"
                    : "outlined"
                }
                size="small"
                sx={(theme) => ({
                  minWidth: 36,
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
                  height: 36,
                  fontWeight: 700,
                  borderRadius: "50%",
                  boxShadow:
                    item === table.getState().pagination.pageIndex + 1
                      ? "0 2px 8px 0 rgba(102,126,234,0.15)"
                      : "none",
                  mx: 0.5,
                  color:
                    item === table.getState().pagination.pageIndex + 1
                      ? theme.palette.common.white
                      : theme.palette.text.primary,
                  background:
                    item === table.getState().pagination.pageIndex + 1
                      ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                      : theme.palette.common.white,
                  border: "1px solid",
                  borderColor:
                    item === table.getState().pagination.pageIndex + 1
                      ? "#667eea"
                      : theme.palette.grey[200],
                  "&:hover": {
                    background:
                      item === table.getState().pagination.pageIndex + 1
                        ? "linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)"
                        : theme.palette.grey[100],
                  },
                  "&.Mui-disabled": {
                    background: theme.palette.grey[200],
                    color: theme.palette.grey[400],
                    borderColor: theme.palette.grey[200],
                  },
                })}
                onClick={() => table.setPageIndex(item - 1)}
                disabled={item === table.getState().pagination.pageIndex + 1}
                aria-current={
                  item === table.getState().pagination.pageIndex + 1
                    ? "page"
                    : undefined
                }
              >
                {item}
              </Button>
            ) : (
              <Typography
                key={idx}
                sx={{
                  color: "#b0b7c3",
                  px: 0.5,
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  userSelect: "none",
                  minWidth: 24,
                  textAlign: "center",
                }}
                component="span"
              >
                ...
              </Typography>
            )
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            sx={(theme) => ({
              borderRadius: "50%",
              minWidth: 36,
              height: 36,
              fontWeight: 700,
              color: theme.palette.text.primary,
              background: theme.palette.grey[100],
              border: "1px solid",
              borderColor: theme.palette.grey[200],
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
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
              mx: 0.5,
              "&:hover": { background: theme.palette.grey[200] },
              "&.Mui-disabled": {
                background: theme.palette.grey[200],
                color: theme.palette.grey[400],
                borderColor: theme.palette.grey[200],
              },
            })}
            aria-label="Next Page"
          >
            <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
            sx={(theme) => ({
              borderRadius: "50%",
              minWidth: 36,
              height: 36,
              fontWeight: 700,
              color: theme.palette.text.primary,
              background: theme.palette.grey[100],
              border: "1px solid",
              borderColor: theme.palette.grey[200],
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
              mx: 0.5,
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
              "&:hover": { background: theme.palette.grey[200] },
              "&.Mui-disabled": {
                background: theme.palette.grey[200],
                color: theme.palette.grey[400],
                borderColor: theme.palette.grey[200],
              },
            })}
            aria-label="Last Page"
          >
            <LastPageIcon sx={{ fontSize: 18 }} />
          </Button>
        </Box>

        {/* Right: (empty for now, can add actions if needed) */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          minWidth={120}
          justifyContent="flex-end"
        >
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 500 }}
          >
            {`Page ${
              table.getState().pagination.pageIndex + 1
            } of ${table.getPageCount()}`}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 500 }}
          >
            {`Showing ${
              table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
              1
            }–${Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )} of ${table.getFilteredRowModel().rows.length}`}
          </Typography>
        </Box>
      </Paper>
    </Paper>
  );
}

// Helper to show tooltip only if text is truncated
function TruncatedWithTooltip({
  text,
  maxWidth = 220,
  variant = "body2",
}: {
  text: string;
  maxWidth?: number;
  variant?: TypographyProps["variant"];
}) {
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  React.useEffect(() => {
    const el = textRef.current;
    if (el) {
      setShowTooltip(el.scrollWidth > el.clientWidth);
    }
  }, [text, maxWidth]);

  return (
    <Tooltip title={showTooltip ? text : ""} arrow placement="top">
      <Typography
        ref={textRef}
        variant={variant}
        noWrap
        sx={{
          maxWidth,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
        }}
        component="span"
      >
        {text}
      </Typography>
    </Tooltip>
  );
}

function ExpandedRowContent({ row }: { row: Row<YouTubeChannel> }) {
  const channel = row.original;
  return (
    <Box sx={{ p: 0.5, background: "#f3f4f6" }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "#667eea",
          mb: 1,
          float:"inline-start",
          fontSize: "1.05rem",
          letterSpacing: 0.2,
        }}
      >
        <VideoLibraryIcon sx={{ color: "#667eea", verticalAlign: "middle", mr: 1 }} />
        Last 3 Videos
      </Typography>
      {channel.last_3_videos && channel.last_3_videos.length > 0 ? (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 1,
            overflow: "hidden",
            mt: 1,
          }}
        >
          <MuiTable
            size="small"
            sx={{
              fontFamily:
                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont",
              background: "#fff",
              border: "none",
              borderRadius: 0.5,
              "& .MuiTableCell-head": {
                background: "#f5f8ff",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "0.98rem",
                borderBottom: "1px solid #e5e7eb",
                borderRight: "1px solid #e5e7eb",
                letterSpacing: 0,
                minHeight: 36,
                height: 36,
                maxHeight: 36,
                textAlign: "center",
                zIndex: 3,
                padding: "6px 10px",
                "&:last-child": {
                  borderRight: "none",
                },
              },
              "& .MuiTableCell-root": {
                color: "#1e293b",
                fontSize: "0.98rem",
                padding: "8px 10px",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxHeight: 36,
                minHeight: 36,
                height: 36,
                textAlign: "center",
                borderBottom: "1px solid #e5e7eb",
                borderRight: "1px solid #e5e7eb",
                "&:last-child": {
                  borderRight: "none",
                },
              },
              "& .MuiTableRow-root:hover": {
                backgroundColor: "#f3f6fa",
              },
              "& .MuiTableRow-root:nth-of-type(even)": {
                backgroundColor: "#f7fafd",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell sx={{ textAlign: "right" }}>Views</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {channel.last_3_videos.map((video, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ maxWidth: 50, padding: "6px 10px" }}>
                    <TruncatedWithTooltip
                      text={video.title}
                      maxWidth={350}
                      variant="subtitle2"
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100, padding: "6px 10px" }}>
                    <TruncatedWithTooltip
                      text={video.description}
                      maxWidth={800}
                      variant="body2"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "right", padding: "6px 10px" }}>
                    <Typography variant="caption">
                      {video.view_count.toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      ) : (
        <Typography variant="body2">No videos found.</Typography>
      )}
    </Box>
  );
}

function Filter({
  column,
  table,
}: {
  column: Column<YouTubeChannel, unknown>;
  table: Table<YouTubeChannel>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === "number" ? (
    <Box
      display="flex"
      gap={1}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <StyledTextField
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        size="small"
        sx={{
          minWidth: 90,
          maxWidth: 90,
          "& .MuiOutlinedInput-root": { height: 36, fontSize: "0.95rem" },
        }}
        inputProps={{ style: { textAlign: "center" } }}
      />
      <StyledTextField
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        size="small"
        sx={{
          minWidth: 90,
          maxWidth: 90,
          "& .MuiOutlinedInput-root": { height: 36, fontSize: "0.95rem" },
        }}
        inputProps={{ style: { textAlign: "center" } }}
      />
    </Box>
  ) : (
    <StyledTextField
      size="small"
      sx={{
        minWidth: 120,
        maxWidth: 160,
        "& .MuiOutlinedInput-root": { height: 36, fontSize: "0.95rem" },
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        column.setFilterValue(e.target.value)
      }
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
      inputProps={{ style: { textAlign: "center" } }}
    />
  );
}

// Helper to generate pagination range with ellipsis
function getPaginationRange(current: number, total: number) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l: number | undefined = undefined;
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current + 1 - delta && i <= current + 1 + delta)
    ) {
      range.push(i);
    }
  }
  for (const i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  return rangeWithDots;
}

export default GridTable;
