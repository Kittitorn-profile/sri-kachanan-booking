'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { adminRevenueRows } from 'src/sections/admin/data/admin-data';

import { AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

const rowsPerPageOptions = [5, 10, 25];

export function AdminRevenueView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const filteredRows = adminRevenueRows.filter((row) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return row.join(' ').toLowerCase().includes(query);
  });
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="รายงานรายได้"
        description="สรุปช่องทางรายได้ประจำเดือนและสัดส่วนยอดขาย"
      />

      <Card>
        <CardHeader title="รายได้ประจำเดือน" subheader="แบ่งตามช่องทางการขาย" />
        <CardContent>
          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาช่องทางรายได้ ยอดเงิน หรือสัดส่วน"
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(0);
            }}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:list-bold" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {paginatedRows.map((row) => (
            <Box
              key={row[0]}
              sx={{
                py: 1.5,
                display: 'grid',
                gap: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 120px 64px' },
              }}
            >
              {row.map((cell) => (
                <Typography key={cell} variant="body2">
                  {cell}
                </Typography>
              ))}
            </Box>
          ))}

          <TablePagination
            component="div"
            page={page}
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onPageChange={(_event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setPage(0);
              setRowsPerPage(parseInt(event.target.value, 10));
            }}
          />
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
