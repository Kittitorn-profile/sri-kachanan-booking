'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthedQuery, useAuthedMutation } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

import { AdminStatusPill, AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type RegistrationRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  approvalStatus: ApprovalStatus;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
};

type AdminUsersResponse = {
  users: {
    id: string;
    email?: string;
    phone?: string;
    displayName?: string;
    approvalStatus: ApprovalStatus;
    requestedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
  }[];
};

type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type RegistrationStatusFilter = 'all' | ApprovalStatus;

const rowsPerPageOptions = [5, 10, 25];

const registrationStatusTabs: { value: RegistrationStatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'คำขอ' },
  { value: 'approved', label: 'อนุมัติ' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
];

const registrationStatusMeta: Record<
  ApprovalStatus,
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  pending: { label: 'รออนุมัติ', color: 'warning' },
  approved: { label: 'อนุมัติแล้ว', color: 'success' },
  rejected: { label: 'ไม่อนุมัติ', color: 'error' },
};

export function AdminRegistrationRequestsView() {
  const [activeStatusTab, setActiveStatusTab] = useState<RegistrationStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, error: fetchRequestsError } = useAuthedQuery<AdminUsersResponse>({
    queryKey: queryKeys.admin.users('user'),
    url: `${endpoints.admin.users}?role=user`,
  });
  const updateRegistrationRequest = useAuthedMutation<
    unknown,
    { userId: string; approvalStatus: ApprovalStatus }
  >({
    method: 'patch',
    url: endpoints.admin.users,
    onSuccess: async () => {
      setRequestsError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users('user') }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users('user', 'pending') }),
      ]);
    },
    onError: (error) => setRequestsError(error.message || 'อัปเดตคำขอไม่สำเร็จ'),
    onSettled: () => setUpdatingUserId(null),
  });
  const registrationRequests: RegistrationRequest[] =
    data?.users.map((user) => ({
      id: user.id,
      name: user.displayName || user.email || 'ไม่ระบุชื่อ',
      email: user.email || '-',
      phone: user.phone || '-',
      approvalStatus: user.approvalStatus,
      requestedAt: user.requestedAt || '-',
      approvedAt: user.approvedAt,
      rejectedAt: user.rejectedAt,
    })) ?? [];
  const statusCounts = registrationRequests.reduce<Record<RegistrationStatusFilter, number>>(
    (counts, request) => {
      counts.all += 1;
      counts[request.approvalStatus] += 1;

      return counts;
    },
    { all: 0, pending: 0, approved: 0, rejected: 0 }
  );
  const filteredRegistrationRequests = registrationRequests.filter((request) => {
    const matchesStatus = activeStatusTab === 'all' || request.approvalStatus === activeStatusTab;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        request.name,
        request.email,
        request.phone,
        request.requestedAt,
        request.approvedAt,
        request.rejectedAt,
        registrationStatusMeta[request.approvalStatus].label,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);

    return matchesStatus && matchesSearch;
  });
  const paginatedRegistrationRequests = filteredRegistrationRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [registrationRequests.length]);

  useEffect(() => {
    setPage(0);
  }, [activeStatusTab, searchQuery]);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="คำขอลงทะเบียนสมาชิก"
        description="ผู้ใช้ใหม่ต้องได้รับการอนุมัติจาก admin ก่อนจึงจะเข้าสู่ระบบได้"
      />

      <Card>
        <CardHeader
          title="รายการคำขอลงทะเบียน"
          action={<AdminStatusPill>รออนุมัติ {statusCounts.pending}</AdminStatusPill>}
        />
        <CardContent>
          {(requestsError || fetchRequestsError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {requestsError || fetchRequestsError?.message}
            </Alert>
          )}

          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาชื่อ อีเมล เบอร์โทร หรือวันที่ส่งคำขอ"
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

          <Tabs
            value={activeStatusTab}
            onChange={(_event, value: RegistrationStatusFilter) => setActiveStatusTab(value)}
            sx={{
              mb: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': { minHeight: 48, fontWeight: 800 },
            }}
          >
            {registrationStatusTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{tab.label}</span>
                    <Chip size="small" variant="soft" label={statusCounts[tab.value]} />
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  {['ผู้ใช้', 'ติดต่อ', 'วันที่ส่งคำขอ', 'สถานะ', 'อัปเดตล่าสุด', 'จัดการ'].map(
                    (column) => (
                      <TableCell key={column} sx={{ color: 'text.secondary', fontWeight: 800 }}>
                        {column}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRegistrationRequests.map((request) => {
                  const status = registrationStatusMeta[request.approvalStatus];
                  const statusDate =
                    request.approvalStatus === 'approved'
                      ? request.approvedAt
                      : request.approvalStatus === 'rejected'
                        ? request.rejectedAt
                        : request.requestedAt;

                  return (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 800 }}>{request.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {request.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{request.phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{request.requestedAt}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="soft"
                          color={status.color}
                          label={status.label}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{statusDate || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        {request.approvalStatus === 'pending' ? (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                              size="small"
                              variant="contained"
                              loading={updatingUserId === request.id}
                              onClick={() => {
                                setUpdatingUserId(request.id);
                                setRequestsError(null);
                                updateRegistrationRequest.mutate({
                                  userId: request.id,
                                  approvalStatus: 'approved',
                                });
                              }}
                              startIcon={<Iconify icon="solar:check-circle-bold" />}
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              loading={updatingUserId === request.id}
                              onClick={() => {
                                setUpdatingUserId(request.id);
                                setRequestsError(null);
                                updateRegistrationRequest.mutate({
                                  userId: request.id,
                                  approvalStatus: 'rejected',
                                });
                              }}
                              startIcon={<Iconify icon="solar:close-circle-bold" />}
                            >
                              ปฏิเสธ
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {!!filteredRegistrationRequests.length && (
            <TablePagination
              component="div"
              page={page}
              count={filteredRegistrationRequests.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setPage(0);
                setRowsPerPage(parseInt(event.target.value, 10));
              }}
            />
          )}

          {!filteredRegistrationRequests.length && !requestsError && (
            <Box
              sx={{
                py: 4,
                px: 2,
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: 'background.neutral',
              }}
            >
              <Iconify width={40} icon="solar:users-group-rounded-bold-duotone" />
              <Typography sx={{ mt: 1, fontWeight: 800 }}>ไม่พบรายการในแท็บนี้</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                เมื่อ user ลงทะเบียนหรือมีการอัปเดตสถานะ รายการจะแสดงตามแท็บที่เลือก
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
