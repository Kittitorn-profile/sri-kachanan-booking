'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthedQuery, useAuthedMutation } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

import { AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type AvailabilityDay = {
  id: string;
  date: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number | null;
  maxBookingsPerDay: number | null;
  note: string;
};

type AvailabilityForm = Omit<AvailabilityDay, 'id' | 'slotIntervalMinutes' | 'maxBookingsPerDay'> & {
  slotIntervalMinutes: string;
  maxBookingsPerDay: string;
};

const emptyAvailabilityForm: AvailabilityForm = {
  date: '',
  isClosed: false,
  openTime: '10:00',
  closeTime: '18:00',
  slotIntervalMinutes: '',
  maxBookingsPerDay: '',
  note: '',
};

const rowsPerPageOptions = [5, 10, 25];

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function parseOptionalInteger(value: string) {
  if (!value.trim()) {
    return null;
  }

  return Number(value);
}

function formatOptionalValue(value: number | null, suffix: string) {
  return value === null ? 'ไม่จำกัด' : `${value} ${suffix}`;
}

export function AdminAvailabilityView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [availabilityForm, setAvailabilityForm] =
    useState<AvailabilityForm>(emptyAvailabilityForm);
  const [editingDay, setEditingDay] = useState<AvailabilityDay | null>(null);
  const [deletingDay, setDeletingDay] = useState<AvailabilityDay | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    data,
    error: fetchAvailabilityError,
    isLoading: loading,
  } = useAuthedQuery<{ availability: AvailabilityDay[] }>({
    queryKey: queryKeys.admin.bookingAvailability,
    url: endpoints.admin.bookingAvailability,
  });
  const saveAvailability = useAuthedMutation<
    { day: AvailabilityDay },
    Omit<AvailabilityDay, 'id'> & { id?: string }
  >({
    method: editingDay ? 'patch' : 'post',
    url: endpoints.admin.bookingAvailability,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.bookingAvailability });
      setIsDialogOpen(false);
      setEditingDay(null);
    },
    onError: (error) => setErrorMessage(error.message || 'บันทึกวันเวลาเปิดรับคิวไม่สำเร็จ'),
  });
  const deleteAvailability = useAuthedMutation<{ success: boolean }, AvailabilityDay>({
    method: 'delete',
    url: (day) => `${endpoints.admin.bookingAvailability}?id=${day.id}`,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.bookingAvailability });
      setDeletingDay(null);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'ลบวันเวลาเปิดรับคิวไม่สำเร็จ');
      setDeletingDay(null);
    },
  });
  const availability = data?.availability ?? [];
  const filteredAvailability = availability.filter((day) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      day.date,
      formatDate(day.date),
      day.openTime,
      day.closeTime,
      formatOptionalValue(day.slotIntervalMinutes, 'นาที'),
      formatOptionalValue(day.maxBookingsPerDay, 'คิว'),
      day.isClosed ? 'ปิดรับคิว' : 'เปิดรับคิว',
      day.note,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
  const paginatedAvailability = filteredAvailability.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [availability.length]);

  const handleOpenCreate = useCallback(() => {
    setEditingDay(null);
    setErrorMessage(null);
    setAvailabilityForm(emptyAvailabilityForm);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((day: AvailabilityDay) => {
    setEditingDay(day);
    setErrorMessage(null);
    setAvailabilityForm({
      date: day.date,
      isClosed: day.isClosed,
      openTime: day.openTime,
      closeTime: day.closeTime,
      slotIntervalMinutes: day.slotIntervalMinutes === null ? '' : String(day.slotIntervalMinutes),
      maxBookingsPerDay: day.maxBookingsPerDay === null ? '' : String(day.maxBookingsPerDay),
      note: day.note,
    });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingDay(null);
    setErrorMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!availabilityForm.date) {
      setErrorMessage('กรุณาเลือกวันที่');
      return;
    }

    if (toMinutes(availabilityForm.openTime) >= toMinutes(availabilityForm.closeTime)) {
      setErrorMessage('เวลาเปิดรับต้องน้อยกว่าเวลาปิดรับ');
      return;
    }

    const slotIntervalMinutes = parseOptionalInteger(availabilityForm.slotIntervalMinutes);
    const maxBookingsPerDay = parseOptionalInteger(availabilityForm.maxBookingsPerDay);

    if (
      slotIntervalMinutes !== null &&
      (!Number.isInteger(slotIntervalMinutes) || slotIntervalMinutes <= 0)
    ) {
      setErrorMessage('กรุณาระบุรอบเวลาเป็นจำนวนนาทีที่มากกว่า 0');
      return;
    }

    if (
      maxBookingsPerDay !== null &&
      (!Number.isInteger(maxBookingsPerDay) || maxBookingsPerDay < 0)
    ) {
      setErrorMessage('กรุณาระบุจำนวนคิวต่อวันเป็นเลข 0 ขึ้นไป');
      return;
    }

    saveAvailability.mutate({
      id: editingDay?.id,
      date: availabilityForm.date,
      isClosed: availabilityForm.isClosed,
      openTime: availabilityForm.openTime,
      closeTime: availabilityForm.closeTime,
      slotIntervalMinutes,
      maxBookingsPerDay,
      note: availabilityForm.note,
    });
  }, [availabilityForm, editingDay, saveAvailability]);

  const handleDelete = useCallback(async () => {
    if (!deletingDay) {
      return;
    }

    deleteAvailability.mutate(deletingDay);
  }, [deleteAvailability, deletingDay]);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="วันเวลาเปิดรับคิว"
        description="กำหนดวันเปิดรับ ช่วงเวลา จำนวนคิวต่อวัน และปิดรับคิวรายวัน"
        action={
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            เพิ่มวันรับคิว
          </Button>
        }
      />

      <Card>
        <CardHeader title="ตารางเปิดรับคิว" subheader="ข้อมูลนี้จะถูกส่งไปให้ลูกค้าเลือกตอนจอง" />
        <CardContent>
          {(errorMessage || fetchAvailabilityError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage || fetchAvailabilityError?.message}
            </Alert>
          )}

          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาวัน เวลา สถานะ หรือหมายเหตุ"
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
              gridTemplateColumns: '1fr 140px 140px 110px 120px 1.2fr 170px',
            }}
          >
            {['วันที่', 'เปิด', 'ปิด', 'รอบละ', 'คิว/วัน', 'สถานะ/หมายเหตุ', 'จัดการ'].map(
              (column) => (
                <Typography key={column} variant="caption" sx={{ color: 'text.secondary' }}>
                  {column}
                </Typography>
              )
            )}
          </Box>

          <Stack divider={<Divider flexItem />} spacing={0}>
            {paginatedAvailability.map((day) => (
              <Box
                key={day.id}
                sx={{
                  py: 1.75,
                  display: 'grid',
                  gap: { xs: 1.25, md: 2 },
                  alignItems: 'start',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1fr 140px 140px 110px 120px 1.2fr 170px',
                  },
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>{formatDate(day.date)}</Typography>
                <Typography variant="body2">{day.openTime}</Typography>
                <Typography variant="body2">{day.closeTime}</Typography>
                <Typography variant="body2">
                  {formatOptionalValue(day.slotIntervalMinutes, 'นาที')}
                </Typography>
                <Typography variant="body2">
                  {formatOptionalValue(day.maxBookingsPerDay, 'คิว')}
                </Typography>
                <Box>
                  <Chip
                    size="small"
                    variant="soft"
                    color={day.isClosed ? 'error' : 'success'}
                    label={day.isClosed ? 'ปิดรับคิว' : 'เปิดรับคิว'}
                  />
                  <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                    {day.note || '-'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenEdit(day)}
                    startIcon={<Iconify icon="solar:pen-bold" />}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => setDeletingDay(day)}
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  >
                    ลบ
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>

          {!!filteredAvailability.length && (
            <TablePagination
              component="div"
              page={page}
              count={filteredAvailability.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setPage(0);
                setRowsPerPage(parseInt(event.target.value, 10));
              }}
            />
          )}

          {!filteredAvailability.length && !loading && (
            <Box sx={{ py: 5, borderRadius: 1, textAlign: 'center', bgcolor: 'background.neutral' }}>
              <Typography sx={{ fontWeight: 800 }}>ยังไม่มีวันเปิดรับคิว</Typography>
            </Box>
          )}

          {loading && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>กำลังโหลดตารางเปิดรับคิว...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog fullWidth maxWidth="sm" open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingDay ? 'แก้ไขวันรับคิว' : 'เพิ่มวันรับคิว'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <TextField
              type="date"
              label="วันที่"
              value={availabilityForm.date}
              onChange={(event) =>
                setAvailabilityForm((current) => ({ ...current, date: event.target.value }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="time"
                label="เปิดรับตั้งแต่"
                value={availabilityForm.openTime}
                onChange={(event) =>
                  setAvailabilityForm((current) => ({ ...current, openTime: event.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                type="time"
                label="เปิดรับถึง"
                value={availabilityForm.closeTime}
                onChange={(event) =>
                  setAvailabilityForm((current) => ({ ...current, closeTime: event.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="รอบละกี่นาที"
                value={availabilityForm.slotIntervalMinutes}
                onChange={(event) =>
                  setAvailabilityForm((current) => ({
                    ...current,
                    slotIntervalMinutes: event.target.value,
                  }))
                }
                helperText="เว้นว่างได้"
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
              <TextField
                fullWidth
                type="number"
                label="รับวันละกี่คิว"
                value={availabilityForm.maxBookingsPerDay}
                onChange={(event) =>
                  setAvailabilityForm((current) => ({
                    ...current,
                    maxBookingsPerDay: event.target.value,
                  }))
                }
                helperText="เว้นว่าง = ไม่จำกัด"
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
            </Stack>
            <TextField
              multiline
              minRows={2}
              label="หมายเหตุ"
              value={availabilityForm.note}
              onChange={(event) =>
                setAvailabilityForm((current) => ({ ...current, note: event.target.value }))
              }
            />
            <FormControlLabel
              label="ปิดรับคิววันนี้"
              control={
                <Switch
                  checked={availabilityForm.isClosed}
                  onChange={(event) =>
                    setAvailabilityForm((current) => ({
                      ...current,
                      isClosed: event.target.checked,
                    }))
                  }
                />
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDialog}>
            ยกเลิก
          </Button>
          <Button variant="contained" disabled={!availabilityForm.date} onClick={handleSave}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deletingDay} onClose={() => setDeletingDay(null)}>
        <DialogTitle>ลบวันรับคิว</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบวันที่ {deletingDay ? formatDate(deletingDay.date) : ''} หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeletingDay(null)}>
            ยกเลิก
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
