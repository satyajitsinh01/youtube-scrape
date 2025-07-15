import  { useMemo, useState } from "react";
import { Box, Typography, Stack, CircularProgress, Paper, Tooltip, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type {
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { formatCellValue, formatColumnHeader } from "../../utils/table";
import type {  VideoResultsTableProps } from "../../types";
import LastThreeVideosModal from "./LastThreeVideosModal";

export default function VideoResultsTable({
  videos,
  loading,
  onRowSelectionChange,
  page,
  pageSize,
  filterModel,
  sortModel,
  onPaginationModelChange,
  onFilterModelChange,
  onSortModelChange,
}: VideoResultsTableProps) {



  // Dynamically generate columns based on the first data item
  const columns = useMemo(() => {
    if (videos.length === 0) return [];
    const firstItem = videos[0];
    // Special renderers for certain fields
    const specialRenderers: { [key: string]: any } = {
      thumbnail: (params: GridRenderCellParams) => (
        <img
          src={params.value as string}
          alt="thumbnail"
          style={{
            width: "100%",
            height: 90,
            objectFit: "cover",
            maxWidth: 160,
          }}
        />
      ),
      tags: (params: GridRenderCellParams) => {
        const tags = params.value as string[];
        if (!tags || tags.length === 0)
          return <Typography variant="body2">N/A</Typography>;
        const tagString =
          tags.slice(0, 3).join(", ") +
          (tags.length > 3 ? ` +${tags.length - 3} more` : "");
        const fullTagString = tags.join(", ");
        return (
          <Tooltip title={fullTagString} arrow placement="top">
            <Typography variant="body2" noWrap>
              {tagString}
            </Typography>
          </Tooltip>
        );
      },
      links: (params: GridRenderCellParams) => {
        const links = params.value as string[];
        if (!links || links.length === 0) return "N/A";
        const display = links.join(", ");
        return (
          <Tooltip title={display} arrow placement="top">
            <Typography variant="body2" noWrap>
              {display}
            </Typography>
          </Tooltip>
        );
      },
    };
    // Get all keys from the first item, EXCLUDING 'last_3_videos' and 'channel_url'
    const allKeys = Object.keys(firstItem).filter(
      (key) => key !== "last_3_videos" && key !== "channel_url"
    );
    // Helper: guess if a field is numeric
    const isNumericField = (key: string) =>
      [
        "subscriber_count",
        "view_count",
        "like_count",
        "comment_count",
        "channel_video_count",
        "channel_total_views",
        "average_view_count",
        "min_views",
        "min_subscribers",
        "limit",
      ].includes(key);
    // Add Show Details button as the first column
    const detailsColumn = {
      field: "details",
      headerName: "Last 3 Videos Details",
      width: 110,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleShowDetails(params.row);
          }}
          sx={{
            outline: 'none !important',
            boxShadow: 'none !important',
            '&:focus': { outline: 'none !important', boxShadow: 'none !important' },
            '&:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
            '&:active': { outline: 'none !important', boxShadow: 'none !important' },
          }}
        >
          Show Details
        </Button>
      ),
      headerAlign: "center" as const,
      align: "center" as const,
    };
    // Add expand/collapse icon as the first column

    return [
  
      ...allKeys.map((key) => ({
        field: key,
        headerName: formatColumnHeader(key),
        flex: 1,
        minWidth: 120,
        filterable: true,
        sortable: true,
        headerAlign: "center" as const,
        type: isNumericField(key) ? "number" : "string",
        renderCell: specialRenderers[key]
          ? specialRenderers[key]
          : (params: GridRenderCellParams) => {
              if (typeof params.value === "boolean")
                return params.value ? "Yes" : "No";
              if (params.value === "true") return "Yes";
              if (params.value === "false") return "No";
              if (
                params.value === undefined ||
                params.value === null ||
                params.value === ""
              ) {
                return (
                  <Typography variant="body2" noWrap>
                    N/A
                  </Typography>
                );
              }
              const valueStr = formatCellValue(params.value);
              return (
                <Tooltip title={valueStr} arrow placement="top">
                  <Typography variant="body2" noWrap>
                    {valueStr}
                  </Typography>
                </Tooltip>
              );
            },
      })),
      detailsColumn,
    ];
  }, [videos]);

  // Add state for modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRow, setDetailsRow] = useState<any | null>(null);
  const handleShowDetails = (row: any) => {
    setDetailsRow(row);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetailsRow(null);
  };

  // DataGrid for main table
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
          py: 2,
          px: 3,
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
          fontSize: "1.2rem",
          letterSpacing: 0.5,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Video Results
      </Box>
      <DataGrid
        rows={videos}
        columns={columns as readonly GridColDef<any>[]}
        aria-label="video results table"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pageSize,
              page: page,
            },
          },
          columns: {
            columnVisibilityModel: {
              channel_published_at: false,
              channel_default_language: false,
              licensed_content: false,
              projection: false,
              channel_hidden_subscriber_count: false,
              caption_available: false,
            },
          },
        }}
        pageSizeOptions={[5, 10, 20, 50]}
        disableRowSelectionOnClick
        autoHeight
        pagination
        onPaginationModelChange={onPaginationModelChange}
        loading={loading}
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        checkboxSelection
        onRowSelectionModelChange={(selectionModel) => {
          const currentData = videos;
          const selectedIds = Array.isArray(selectionModel.ids)
            ? selectionModel.ids
            : Array.from(selectionModel.ids || []);
          const selectedRowData = currentData.filter((row) =>
            selectedIds.includes(row.id)
          );
          onRowSelectionChange(selectedRowData);
        }}
        getRowId={(row) => row.id}
        slots={{
          toolbar: GridToolbar,
          noRowsOverlay: () => (
            <Stack
              height="100%"
              alignItems="center"
              justifyContent="center"
              sx={{ background: "#fff" }}
            >
              <Typography color="text.secondary">
                No videos found. Try adjusting your search terms or filters.
              </Typography>
            </Stack>
          ),
          loadingOverlay: () => (
            <Stack
              height="100%"
              alignItems="center"
              justifyContent="center"
              sx={{ background: "#fff" }}
            >
              <CircularProgress />
            </Stack>
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
            printOptions: { disableToolbarButton: true },
            csvOptions: { disableToolbarButton: false },
          },
        }}
        disableColumnFilter={false}
        disableColumnSelector={false}
        disableDensitySelector={false}
        disableColumnMenu={false}
        sx={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont",
          background: "#fff",
          border: "none",
          borderRadius: 0.5,
          "& .MuiDataGrid-columnHeaders": {
            background: "#f5f8ff !important",
            backgroundColor: "#f5f8ff !important",
            color: "#1e293b !important",
            fontWeight: 700,
            fontSize: "1rem",
            borderBottom: "1px solid #e5e7eb",
            letterSpacing: 0,
            minHeight: 40,
            height: 40,
            maxHeight: 40,
            textAlign: "center",
            boxShadow: "0 2px 8px 0 rgba(102,126,234,0.04)",
            zIndex: 3,
          },
          "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle, & .css-1gqmilo-MuiDataGrid-columnHeaderTitle":
            {
              color: "#1e293b !important",
              fontWeight: 600,
              fontSize: "1rem",
              textShadow: "none",
              background: "#f5f8ff !important",
              backgroundColor: "#f5f8ff !important",
            },
          "& .MuiDataGrid-cell": {
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          "& .MuiDataGrid-row": {
            transition: "background 0.2s",
            minHeight: 40,
            maxHeight: 40,
            height: 40,
            "&:hover": {
              backgroundColor: "#f3f6fa",
            },
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: "#e0e7ff",
            },
            margin: 0,
            borderRadius: 0,
          },
          "& .MuiDataGrid-row--firstVisible": {
            minHeight: 40,
            maxHeight: 40,
            height: 40,
            margin: 0,
            borderRadius: 0,
          },
          "& .MuiDataGrid-footerContainer": {
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            minHeight: 40,
            height: 40,
          },
          "& .MuiDataGrid-toolbarContainer": {
            background: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 8px",
          },
          "& .MuiDataGrid-virtualScroller": {
            background: "#fff",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-selectedRowCount": {
            color: "#6366f1",
            fontWeight: 600,
          },
          "& .MuiDataGrid-cellCheckbox": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          },
          "& .MuiCheckbox-root": {
            margin: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          "& .MuiTablePagination-toolbar": {
            minHeight: 40,
            height: 40,
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
            {
              outline: "none !important",
            },
          "& .MuiDataGrid-sortIcon, & .MuiDataGrid-sortIcon:focus, & .MuiDataGrid-sortIcon:focus-visible, & .MuiDataGrid-sortIcon:focus-within":
            {
              outline: "none !important",
              boxShadow: "none !important",
            },
          "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer:focus, & .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer:active":
            {
              outline: "none !important",
              boxShadow: "none !important",
            },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f7fafd",
          },
        }}
        density="comfortable"
        rowHeight={35}
      />
      {/* Details Modal */}
      <LastThreeVideosModal open={detailsOpen} onClose={handleCloseDetails} detailsRow={detailsRow} />
    </Paper>
  );
}
