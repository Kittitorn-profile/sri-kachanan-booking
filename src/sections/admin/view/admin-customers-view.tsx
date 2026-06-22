'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthedQuery } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

import { AdminStatusPill, AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type SpaCustomer = {
  id: string;
  profileId: string | null;
  displayName: string;
  phone: string;
  email: string | null;
  totalVisits: number;
  lastVisitedAt: string | null;
  lastNote: string;
  lastService: string;
  lastStaff: string;
};

const rowsPerPageOptions = [5, 10, 25];

function formatDateTime(dateValue: string | null) {
  if (!dateValue) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}

export function AdminCustomersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const trimmedSearch = searchQuery.trim();
  const {
    data,
    error,
    isLoading: loading,
    refetch: fetchCustomers,
  } = useAuthedQuery<{ customers: SpaCustomer[] }>({
    queryKey: queryKeys.admin.customers(trimmedSearch),
    url: endpoints.admin.customers,
    config: { params: trimmedSearch ? { search: trimmedSearch } : undefined },
  });
  const customers = data?.customers ?? [];
  const paginatedCustomers = customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [customers.length, searchQuery]);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="ลูกค้า CRM"
        description="เก็บเฉพาะลูกค้าที่เคยทำสปาและปิดงานบริการเป็น completed แล้ว"
        action={
          <Button
            variant="outlined"
            onClick={() => fetchCustomers()}
            startIcon={<Iconify icon="solar:restart-bold" />}
          >
            รีเฟรช
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="ข้อมูลลูกค้า"
          subheader="ข้อมูลจะเข้าตารางนี้หลังจากนัดหมายถูกบันทึกว่าใช้บริการจบแล้ว"
          action={<AdminStatusPill>{customers.length} รายการ</AdminStatusPill>}
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}

          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล"
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

          <Box
            sx={{
              mb: 1,
              display: { xs: 'none', md: 'grid' },
              gap: 2,
              gridTemplateColumns: '1.2fr 1fr 100px 1.2fr 1.2fr 1.5fr',
            }}
          >
            {['ลูกค้า', 'ติดต่อ', 'จำนวนครั้ง', 'บริการล่าสุด', 'พนักงานล่าสุด', 'ใช้บริการล่าสุด'].map(
              (column) => (
                <Typography key={column} variant="caption" sx={{ color: 'text.secondary' }}>
                  {column}
                </Typography>
              )
            )}
          </Box>

          <Stack divider={<Divider flexItem />} spacing={0}>
            {paginatedCustomers.map((customer) => (
              <Box
                key={customer.id}
                sx={{
                  py: 1.75,
                  display: 'grid',
                  gap: { xs: 1, md: 2 },
                  alignItems: 'start',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1.2fr 1fr 100px 1.2fr 1.2fr 1.5fr',
                  },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{customer.displayName}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {customer.lastNote || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">{customer.phone}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {customer.email || '-'}
                  </Typography>
                </Box>
                <Typography variant="body2">{customer.totalVisits} ครั้ง</Typography>
                <Typography variant="body2">{customer.lastService}</Typography>
                <Typography variant="body2">{customer.lastStaff}</Typography>
                <Typography variant="body2">{formatDateTime(customer.lastVisitedAt)}</Typography>
              </Box>
            ))}
          </Stack>

          {!!customers.length && (
            <TablePagination
              component="div"
              page={page}
              count={customers.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setPage(0);
                setRowsPerPage(parseInt(event.target.value, 10));
              }}
            />
          )}

          {!customers.length && !loading && (
            <Box sx={{ py: 5, borderRadius: 1, textAlign: 'center', bgcolor: 'background.neutral' }}>
              <Typography sx={{ fontWeight: 800 }}>ยังไม่มีข้อมูลลูกค้า</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                เมื่อลูกค้าทำสปาจบและบันทึกสถานะ completed รายการจะมาแสดงที่นี่
              </Typography>
            </Box>
          )}

          {loading && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>กำลังโหลดข้อมูลลูกค้า...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
