'use client';

import type { ReactNode } from 'react';

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
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthedQuery, useAuthedMutation } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

import { AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type SpaBookingRequest = {
  id: string;
  bookingNo: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  customerNote: string;
  imageUrls: string[];
  jobItems: string;
  jobImageUrls: string[];
  jobOpenedAt?: string;
  service: string;
  category: string;
  duration: string;
  price: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  mode?: 'queue' | 'working';
};

type QueueStatusFilter = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'cancelled';

const bookingStatusMeta: Record<
  SpaBookingRequest['status'],
  { label: string; color: 'default' | 'success' | 'warning' | 'error' }
> = {
  pending: { label: 'รอยืนยันคิว', color: 'warning' },
  confirmed: { label: 'ยืนยันคิวแล้ว', color: 'success' },
  in_progress: { label: 'เปิดงานแล้ว', color: 'warning' },
  completed: { label: 'ปิดงานแล้ว', color: 'default' },
  cancelled: { label: 'ยกเลิก', color: 'error' },
};

const rowsPerPageOptions = [5, 10, 25];

const queueStatusTabs: { value: QueueStatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'คำขอ' },
  { value: 'confirmed', label: 'ยืนยัน' },
  { value: 'in_progress', label: 'เปิดงาน' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box
      sx={{
        p: 1.5,
        display: 'grid',
        gap: 1,
        borderRadius: 1,
        bgcolor: 'background.neutral',
        gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Box>
  );
}

export function AdminServicesView({ mode = 'queue' }: Props) {
  const [activeStatusTab, setActiveStatusTab] = useState<QueueStatusFilter>('all');
  const [viewingBooking, setViewingBooking] = useState<SpaBookingRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const isWorkingMode = mode === 'working';
  const bookingStatus = isWorkingMode ? 'working' : undefined;
  const bookingsQueryKey = queryKeys.admin.spaBookings(bookingStatus);
  const queryClient = useQueryClient();
  const endpoint = isWorkingMode
    ? `${endpoints.admin.spaBookings}?status=working`
    : endpoints.admin.spaBookings;
  const {
    data,
    error,
    isLoading: loadingBookings,
    refetch: fetchBookingRequests,
  } = useAuthedQuery<{ bookings: SpaBookingRequest[] }>({
    queryKey: bookingsQueryKey,
    url: endpoint,
  });
  const updateBookingStatus = useAuthedMutation<
    { booking: SpaBookingRequest },
    { bookingId: string; status: SpaBookingRequest['status'] }
  >({
    method: 'patch',
    url: endpoints.admin.spaBookings,
    onSuccess: async () => {
      setBookingError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.spaBookings('working') }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.spaBookings() }),
      ]);
    },
    onError: (mutationError) => {
      setBookingError(mutationError.message || 'อัปเดตสถานะคิวไม่สำเร็จ');
    },
  });
  const bookingRequests = data?.bookings ?? [];
  const statusCounts = bookingRequests.reduce<Record<QueueStatusFilter, number>>(
    (counts, booking) => {
      counts.all += 1;

      if (booking.status in counts) {
        counts[booking.status as QueueStatusFilter] += 1;
      }

      return counts;
    },
    { all: 0, pending: 0, confirmed: 0, in_progress: 0, cancelled: 0 }
  );
  const filteredBookings = bookingRequests.filter((booking) => {
    const matchesStatus = isWorkingMode || activeStatusTab === 'all' || booking.status === activeStatusTab;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        booking.bookingNo,
        booking.customerName,
        booking.customerEmail,
        booking.phone,
        booking.service,
        booking.category,
        booking.date,
        booking.time,
        booking.customerNote,
        booking.jobItems,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);

    return matchesStatus && matchesSearch;
  });
  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [bookingRequests.length]);

  useEffect(() => {
    setPage(0);
  }, [activeStatusTab, searchQuery]);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title={isWorkingMode ? 'รายการงานทำความสะอาดสินค้า' : 'จัดการคิวสปาสินค้า'}
        description={
          isWorkingMode
            ? 'แสดงเฉพาะงานที่ user กดเปิดงานและส่งรายละเอียดสินค้าแล้ว'
            : 'คำขอจองคิวทำความสะอาดสินค้าจาก user สำหรับตรวจสอบและยืนยันคิว'
        }
        action={
          <Button
            variant="outlined"
            onClick={() => fetchBookingRequests()}
            startIcon={<Iconify icon="solar:restart-bold" />}
          >
            รีเฟรช
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={isWorkingMode ? 'งานที่เปิดแล้ว' : 'รายการคำขอจองคิว'}
          subheader={
            isWorkingMode
              ? 'รายการจะเข้าหน้านี้ก็ต่อเมื่อ user กดเปิดงานจากนัดหมายเดิม'
              : 'ร้านหรือแอดมินกดยืนยันคิว เพื่อให้ user เปิดงานเมื่อถึงวันที่จอง'
          }
        />
        <CardContent>
          {(bookingError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookingError || error?.message}
            </Alert>
          )}

          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาเลขจอง ลูกค้า เบอร์โทร บริการ หรือหมวดหมู่"
            onChange={(event) => setSearchQuery(event.target.value)}
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

          {!isWorkingMode && (
            <Tabs
              value={activeStatusTab}
              onChange={(_event, value: QueueStatusFilter) => setActiveStatusTab(value)}
              sx={{
                mb: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '& .MuiTab-root': { minHeight: 48, fontWeight: 800 },
              }}
            >
              {queueStatusTabs.map((tab) => (
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
          )}

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                  {['เลขจอง/ลูกค้า', 'บริการ', 'วันเวลา', 'หมวดหมู่', 'รูป', 'สถานะ', 'จัดการ'].map(
                    (column) => (
                      <TableCell key={column} sx={{ color: 'text.secondary', fontWeight: 800 }}>
                        {column}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBookings.map((booking) => {
                  const status = bookingStatusMeta[booking.status];
                  const canConfirm = booking.status === 'pending';
                  const canCloseJob = isWorkingMode && booking.status === 'in_progress';
                  const canCancel = !['completed', 'cancelled'].includes(booking.status);

                  return (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 800 }}>{booking.bookingNo}</Typography>
                        <Typography variant="body2">{booking.customerName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {booking.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{booking.service}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {booking.duration} / {booking.price.toLocaleString()} บาท
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(booking.date)} เวลา {booking.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{booking.category}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="soft"
                          label={`${booking.imageUrls.length}/4`}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="soft" color={status.color} label={status.label} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setViewingBooking(booking)}
                            startIcon={<Iconify icon="solar:eye-bold" />}
                          >
                            ดู
                          </Button>
                          {!isWorkingMode && (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={!canConfirm}
                              onClick={() =>
                                updateBookingStatus.mutate({
                                  bookingId: booking.id,
                                  status: 'confirmed',
                                })
                              }
                              startIcon={<Iconify icon="solar:check-circle-bold" />}
                            >
                              ยืนยันคิว
                            </Button>
                          )}
                          {isWorkingMode && (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={!canCloseJob}
                              onClick={() =>
                                updateBookingStatus.mutate({
                                  bookingId: booking.id,
                                  status: 'completed',
                                })
                              }
                              startIcon={<Iconify icon="solar:check-circle-bold" />}
                            >
                              ปิดงาน
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={!canCancel}
                            onClick={() =>
                              updateBookingStatus.mutate({
                                bookingId: booking.id,
                                status: 'cancelled',
                              })
                            }
                            startIcon={<Iconify icon="solar:close-circle-bold" />}
                          >
                            ยกเลิก
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {!filteredBookings.length && !loadingBookings && (
            <Box
              sx={{
                py: 5,
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: 'background.neutral',
              }}
            >
              <Typography sx={{ fontWeight: 800 }}>
                {isWorkingMode ? 'ยังไม่มีงานที่ user เปิดแล้ว' : 'ยังไม่มีคิวสปาสินค้าจาก user'}
              </Typography>
            </Box>
          )}

          {!!filteredBookings.length && (
            <TablePagination
              component="div"
              page={page}
              count={filteredBookings.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setPage(0);
                setRowsPerPage(parseInt(event.target.value, 10));
              }}
            />
          )}

          {loadingBookings && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>กำลังโหลดรายการคิว...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog fullWidth maxWidth="md" open={!!viewingBooking} onClose={() => setViewingBooking(null)}>
        <DialogTitle>รายละเอียดคำขอจองคิว</DialogTitle>
        <DialogContent>
          {viewingBooking && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                  {viewingBooking.bookingNo}
                </Typography>
                <Chip
                  size="small"
                  variant="soft"
                  color={bookingStatusMeta[viewingBooking.status].color}
                  label={bookingStatusMeta[viewingBooking.status].label}
                />
              </Stack>

              <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                <DetailItem label="ลูกค้า" value={viewingBooking.customerName} />
                <DetailItem label="เบอร์โทร" value={viewingBooking.phone} />
                <DetailItem label="อีเมล" value={viewingBooking.customerEmail || '-'} />
                <DetailItem
                  label="วันเวลา"
                  value={`${formatDate(viewingBooking.date)} เวลา ${viewingBooking.time}`}
                />
                <DetailItem label="บริการ" value={viewingBooking.service} />
                <DetailItem
                  label="ราคา/ระยะเวลา"
                  value={`${viewingBooking.duration} / ${viewingBooking.price.toLocaleString()} บาท`}
                />
                <DetailItem label="หมวดหมู่" value={viewingBooking.category} />
                <DetailItem label="หมายเหตุ" value={viewingBooking.customerNote || '-'} />
                <DetailItem label="เปิดงานเมื่อ" value={viewingBooking.jobOpenedAt || '-'} />
                <DetailItem label="สินค้าที่ทำความสะอาด" value={viewingBooking.jobItems || '-'} />
              </Box>

              <Box>
                <Typography sx={{ mb: 1, fontWeight: 900 }}>
                  รูปภาพจาก user ({viewingBooking.imageUrls.length}/4)
                </Typography>
                {viewingBooking.imageUrls.length ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                    }}
                  >
                    {viewingBooking.imageUrls.slice(0, 4).map((imageUrl, index) => (
                      <Box
                        key={imageUrl}
                        component="a"
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          overflow: 'hidden',
                          borderRadius: 1,
                          aspectRatio: '1 / 1',
                          bgcolor: 'background.neutral',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={`booking-${viewingBooking.bookingNo}-${index + 1}`}
                          sx={{ width: 1, height: 1, display: 'block', objectFit: 'cover' }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      py: 4,
                      px: 2,
                      borderRadius: 1,
                      textAlign: 'center',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>ไม่มีรูปภาพแนบ</Typography>
                  </Box>
                )}
              </Box>

              <Box>
                <Typography sx={{ mb: 1, fontWeight: 900 }}>
                  รูปภาพสินค้าเปิดงาน ({viewingBooking.jobImageUrls.length}/4)
                </Typography>
                {viewingBooking.jobImageUrls.length ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                    }}
                  >
                    {viewingBooking.jobImageUrls.slice(0, 4).map((imageUrl, index) => (
                      <Box
                        key={imageUrl}
                        component="a"
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          overflow: 'hidden',
                          borderRadius: 1,
                          aspectRatio: '1 / 1',
                          bgcolor: 'background.neutral',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={`job-${viewingBooking.bookingNo}-${index + 1}`}
                          sx={{ width: 1, height: 1, display: 'block', objectFit: 'cover' }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      py: 4,
                      px: 2,
                      borderRadius: 1,
                      textAlign: 'center',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>ยังไม่มีรูปสินค้าเปิดงาน</Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </DashboardContent>
  );
}
