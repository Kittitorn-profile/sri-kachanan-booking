'use client';

import type {
  SpaService,
  BookingForm,
  BookingItem,
  SpaCategory,
  AvailabilityDay,
} from './booking-types';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const bookingSteps = ['บริการ', 'วันเวลา', 'ข้อมูล', 'ยืนยัน'];

function getUnavailableDateReason(date: AvailabilityDay) {
  if (date.isClosed) {
    return 'ปิดรับคิว';
  }

  if (date.remainingBookings === 0) {
    return 'คิวเต็ม';
  }

  if (!date.slots.length) {
    return 'ไม่มีเวลาว่าง';
  }

  return null;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type BookingDrawerProps = {
  open: boolean;
  form: BookingForm;
  activeStep: number;
  bookings: BookingItem[];
  categories: SpaCategory[];
  services: SpaService[];
  editingBooking: BookingItem | null;
  availableDates: AvailabilityDay[];
  errorMessage: string | null;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onChange: (patch: Partial<BookingForm>) => void;
};

export function BookingDrawer({
  open,
  form,
  activeStep,
  bookings,
  categories,
  services,
  editingBooking,
  availableDates,
  errorMessage,
  onClose,
  onBack,
  onNext,
  onSubmit,
  onChange,
}: BookingDrawerProps) {
  const selectedService = services.find((service) => service.id === form.serviceId);
  const activeCategoryId =
    form.categoryId || selectedService?.categoryId || categories[0]?.id || '';
  const selectedCategory = categories.find((category) => category.id === activeCategoryId);
  const selectedDate = availableDates.find((date) => date.date === form.date);
  const selectedDateLabel = selectedDate?.fullLabel ?? form.date;

  const isSlotBooked = useCallback(
    (time: string) =>
      bookings.some(
        (booking) =>
          booking.id !== editingBooking?.id &&
          booking.date === form.date &&
          booking.time === time &&
          booking.status !== 'cancelled'
      ),
    [bookings, editingBooking?.id, form.date]
  );

  const renderServiceStep = () => (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 900 }}>เลือกประเภทงานทำความสะอาดสินค้า</Typography>

      {!categories.length && <Alert severity="warning">ยังไม่มีประเภทงานให้เลือก</Alert>}

      {!!categories.length && (
        <Stack direction="column" spacing={1.25} sx={{ pb: 0.5 }}>
          {categories.map((category) => {
            const firstService = services.find((service) => service.categoryId === category.id);
            const isActive = activeCategoryId === category.id;
            const description = stripHtml(category.description);
            const handleSelectCategory = () =>
              onChange({
                categoryId: category.id,
                serviceId: firstService?.id ?? '',
              });

            return (
              <Box
                key={category.id}
                role="button"
                tabIndex={0}
                onClick={handleSelectCategory}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelectCategory();
                  }
                }}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: isActive ? '#f0f8f1' : '#fff',
                  border: '1px solid',
                  borderColor: isActive ? '#1f6f4a' : '#e4ebe6',
                  boxShadow: isActive ? '0 14px 36px rgba(31, 111, 74, 0.12)' : 'none',
                  cursor: 'pointer',
                  transition:
                    'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
                  '&:hover': {
                    borderColor: isActive ? '#1f6f4a' : '#b8c9bd',
                    boxShadow: '0 14px 34px rgba(31, 111, 74, 0.10)',
                    transform: 'translateY(-1px)',
                  },
                  '&:focus-visible': {
                    outline: '3px solid rgba(31, 111, 74, 0.22)',
                    outlineOffset: 2,
                  },
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography sx={{ fontSize: 17, fontWeight: 950 }}>
                          {category.name}
                        </Typography>
                        {isActive && (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.35,
                              borderRadius: 999,
                              color: '#1f6f4a',
                              fontSize: 12,
                              fontWeight: 900,
                              bgcolor: '#dff4e7',
                            }}
                          >
                            เลือกอยู่
                          </Box>
                        )}
                      </Stack>
                      <Typography sx={{ mt: 0.6, color: '#7a6a58', fontSize: 13, lineHeight: 1.6 }}>
                        {description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );

  const renderDateTimeStep = () => (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ mb: 1.2, fontWeight: 900 }}>วันที่</Typography>
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
          {availableDates.map((date) => (
            <Button
              key={date.id}
              variant={form.date === date.date ? 'contained' : 'outlined'}
              onClick={() => onChange({ date: date.date, time: '' })}
              sx={{ minWidth: 80, borderRadius: 1 }}
            >
              {date.label}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography sx={{ mb: 1.2, fontWeight: 900 }}>เวลา</Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
        >
          {(selectedDate?.slots ?? []).map((time) => {
            const booked = isSlotBooked(time);

            return (
              <Button
                key={time}
                disabled={booked}
                variant={form.time === time ? 'contained' : 'outlined'}
                onClick={() => onChange({ time })}
                startIcon={<Iconify icon="solar:clock-circle-bold" />}
                sx={{ height: 48, borderRadius: 1 }}
              >
                {booked ? `${time} เต็ม` : time}
              </Button>
            );
          })}
        </Box>
        <Typography sx={{ mt: 1.2, color: '#7a6a58', fontSize: 13 }}>
          เปิดรับ {selectedDate?.openTime ?? '-'}-{selectedDate?.closeTime ?? '-'} น. เหลือ{' '}
          {selectedDate?.maxBookingsPerDay === null
            ? 'ไม่จำกัดคิว'
            : `${selectedDate?.remainingBookings ?? 0}/${selectedDate?.maxBookingsPerDay ?? 0} คิว`}
        </Typography>
        {selectedDate?.note && (
          <Typography sx={{ mt: 0.5, color: '#9b2f2f', fontSize: 13 }}>
            {selectedDate.note}
          </Typography>
        )}
        {selectedDate && !selectedDate.slots.length && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            {getUnavailableDateReason(selectedDate) === 'ไม่มีเวลาว่าง'
              ? 'วันนี้ไม่มีช่วงเวลาว่างให้จอง หรือช่วงเวลาที่เปิดรับผ่านไปแล้ว'
              : getUnavailableDateReason(selectedDate)}
          </Alert>
        )}
      </Box>
    </Stack>
  );

  const renderCustomerStep = () => (
    <Stack spacing={1.5}>
      <Typography sx={{ fontWeight: 900 }}>ข้อมูลผู้จอง</Typography>
      <TextField
        fullWidth
        label="ชื่อ-นามสกุล"
        value={form.customerName}
        onChange={(event) => onChange({ customerName: event.target.value })}
      />
      <TextField
        fullWidth
        label="เบอร์โทรศัพท์"
        value={form.phone}
        onChange={(event) => onChange({ phone: event.target.value })}
      />
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="หมายเหตุถึงร้าน"
        value={form.customerNote}
        onChange={(event) => onChange({ customerNote: event.target.value })}
      />
      <Box>
        <Typography sx={{ mb: 1, fontWeight: 900 }}>รูปภาพประกอบ (สูงสุด 4 รูป)</Typography>
        <Stack spacing={1}>
          {form.imageUrls.map((imageUrl, index) => (
            <TextField
              key={index}
              fullWidth
              label={`URL รูปภาพ ${index + 1}`}
              value={imageUrl}
              onChange={(event) => {
                const nextImageUrls = [...form.imageUrls];

                nextImageUrls[index] = event.target.value;
                onChange({ imageUrls: nextImageUrls });
              }}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );

  const renderConfirmStep = () => (
    <Stack spacing={1.5}>
      <Typography sx={{ fontWeight: 900 }}>ตรวจสอบนัดหมาย</Typography>
      {[
        ['บริการ', selectedCategory?.name ?? '-'],
        ['วันเวลา', `${selectedDateLabel} เวลา ${form.time || '-'}`],
        ['ผู้จอง', form.customerName || '-'],
        ['เบอร์โทร', form.phone || '-'],
        ['หมายเหตุ', form.customerNote || '-'],
        ['รูปภาพ', `${form.imageUrls.filter(Boolean).length}/4 รูป`],
      ].map(([label, value]) => (
        <Box
          key={label}
          sx={{
            p: 1.5,
            display: 'grid',
            gap: 1,
            borderRadius: 1,
            bgcolor: '#fff',
            gridTemplateColumns: '110px 1fr',
            border: '1px solid #e4ebe6',
          }}
        >
          <Typography sx={{ color: '#64706b', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
          <Typography sx={{ fontSize: 14 }}>{value}</Typography>
        </Box>
      ))}
    </Stack>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: 1, sm: 520 },
            bgcolor: '#fbf7ef',
          },
        },
      }}
    >
      <Stack sx={{ height: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2 }}
        >
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 950 }}>
              {editingBooking ? 'เลื่อนนัดหมาย' : 'จองคิวสปาสินค้า'}
            </Typography>
            <Typography sx={{ mt: 0.5, color: '#65716b', fontSize: 14 }}>
              เลือกบริการ วัน เวลา และยืนยันคิวให้ครบในขั้นตอนเดียว
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <Divider />

        <Stack spacing={2.5} sx={{ p: 2.5, overflowY: 'auto' }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {activeStep === 0 && renderServiceStep()}
          {activeStep === 1 && renderDateTimeStep()}
          {activeStep === 2 && renderCustomerStep()}
          {activeStep === 3 && renderConfirmStep()}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 2.5, mt: 'auto', bgcolor: '#fff', borderTop: '1px solid #e4ebe6' }}
        >
          <Button
            fullWidth
            size="large"
            variant="outlined"
            disabled={activeStep === 0}
            onClick={onBack}
            sx={{ height: 52, borderRadius: 999 }}
          >
            ย้อนกลับ
          </Button>
          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={activeStep === bookingSteps.length - 1 ? onSubmit : onNext}
            startIcon={
              activeStep === bookingSteps.length - 1 ? (
                <Iconify icon="solar:check-circle-bold" />
              ) : undefined
            }
            sx={{ height: 52, borderRadius: 999, bgcolor: '#101513' }}
          >
            {activeStep === bookingSteps.length - 1 ? 'ยืนยันการจอง' : 'ถัดไป'}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
