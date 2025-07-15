import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Divider, Button, Box, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Typography } from "@mui/material";

interface LastThreeVideosModalProps {
  open: boolean;
  onClose: () => void;
  detailsRow: any | null;
}

const LastThreeVideosModal: React.FC<LastThreeVideosModalProps> = ({ open, onClose, detailsRow }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#4f46e5', fontSize: '1.25rem', letterSpacing: 0.2, pb: 0 }}>
        Last 3 Videos
      </DialogTitle>
      <Divider sx={{ mb: 1 }} />
      <DialogContent sx={{ p: 2, background: '#f9fafb' }}>
        {detailsRow && (
          <Box sx={{ border: '1.5px solid #d1d5db', borderRadius: 1, background: '#fff', boxShadow: 'none', p: 0 }}>
            <Table size="small" sx={{ minWidth: 400, borderCollapse: 'collapse', borderSpacing: 0 }}>
              <TableHead>
                <TableRow sx={{ background: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b', minWidth: 120, textAlign: 'center' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b', minWidth: 180, textAlign: 'center' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b', minWidth: 80, textAlign: 'center' }}>View Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(detailsRow.last_3_videos || []).map((v: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ maxWidth: 180, minWidth: 120, p: 1 }}>
                      <Tooltip title={v.title} arrow placement="top">
                        <Typography noWrap sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.97rem' }}>{v.title}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260, minWidth: 180, p: 1 }}>
                      <Tooltip title={v.description} arrow placement="top">
                        <Typography noWrap sx={{ maxWidth: 420,overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.97rem' }}>{v.description}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ minWidth: 80, p: 1 ,textAlign: 'center'}}>
                      <Tooltip title={String(v.view_count)} arrow placement="top">
                        <Typography noWrap sx={{ fontSize: '0.97rem' }}>{v.view_count}</Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ background: '#f9fafb', p: 2 }}>
        <Button onClick={onClose} color="primary" variant="contained" sx={{ fontWeight: 600, borderRadius: 1,           
         outline: 'none !important',
            boxShadow: 'none !important',
            '&:focus': { outline: 'none !important', boxShadow: 'none !important' },
            '&:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
            '&:active': { outline: 'none !important', boxShadow: 'none !important' }}}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LastThreeVideosModal; 