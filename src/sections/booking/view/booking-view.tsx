'use client';

import type React from 'react';

import { useBoolean } from 'minimal-shared/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { useAuthedQuery, useAuthedMutation } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type SpaService = {
  id: string;
  name: string;
  categoryId: string | null;
  duration: string;
  durationMinutes: number;
  price: number;
};

type SpaCategory = {
  id: string;
  name: string;
  description: string;
};

type AvailabilityDay = {
  id: string;
  date: string;
  label: string;
  fullLabel: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number | null;
  maxBookingsPerDay: number | null;
  bookedCount: number;
  remainingBookings: number | null;
  note: string;
  slots: string[];
};

type BookingStatus = 'confirmed' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

type StatusFilter = 'all' | BookingStatus;

type BookingItem = {
  id: string;
  bookingNo: string;
  serviceId: string;
  categoryId: string | null;
  service: string;
  duration: string;
  price: number;
  date: string;
  dateLabel: string;
  time: string;
  staffId?: string;
  staff?: string;
  customerName: string;
  phone: string;
  customerNote: string;
  imageUrls: string[];
  jobItems: string;
  jobImageUrls: string[];
  jobOpenedAt?: string;
  status: BookingStatus;
  note: string;
};

type BookingForm = {
  serviceId: string;
  categoryId: string;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  customerNote: string;
  imageUrls: string[];
};

type OpenJobForm = {
  jobItems: string;
  jobImageUrls: string[];
};

type BookingApiResponse = {
  profile: {
    displayName?: string;
    phone?: string;
  };
  services: SpaService[];
  availability: AvailabilityDay[];
  bookings: Omit<BookingItem, 'dateLabel' | 'note'>[];
};

type BookingMutationResponse = {
  booking: Omit<BookingItem, 'dateLabel' | 'note'>;
};

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอยืนยันคิว' },
  { value: 'confirmed', label: 'ยืนยันคิวแล้ว' },
  { value: 'in_progress', label: 'กำลังทำงาน' },
  { value: 'completed', label: 'ใช้บริการแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

const statusMeta: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'รอยืนยันคิว', color: '#8a5b26', bgColor: '#f5ddba' },
  confirmed: { label: 'ยืนยันคิวแล้ว', color: '#1f6f4a', bgColor: '#dff4e7' },
  in_progress: { label: 'กำลังทำงาน', color: '#6f4b1f', bgColor: '#f4eadf' },
  completed: { label: 'ใช้บริการแล้ว', color: '#315a8f', bgColor: '#dfeafa' },
  cancelled: { label: 'ยกเลิก', color: '#9b2f2f', bgColor: '#fde2df' },
};

const bookingSteps = ['บริการ', 'วันเวลา', 'ข้อมูล', 'ยืนยัน'];

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function toDateValue(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';

  return `${value('year')}-${value('month')}-${value('day')}`;
}

function canOpenBookingJob(
  booking: Pick<BookingItem, 'date' | 'time' | 'status'>,
  nowMs = Date.now()
) {
  if (booking.status !== 'confirmed') {
    return false;
  }

  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);

  return nowMs >= bookingDateTime.getTime();
}

function getBookingNote(status: BookingStatus) {
  const notes: Record<BookingStatus, string> = {
    pending: 'ส่งคำขอจองแล้ว รอร้านยืนยันคิว',
    confirmed: 'ยืนยันคิวแล้ว เปิดงานได้เมื่อถึงวันและเวลาที่จอง',
    in_progress: 'เปิดงานแล้ว ร้านกำลังตรวจสอบสินค้าที่ส่งมา',
    completed: 'ปิดงานแล้ว สามารถให้คะแนนได้',
    cancelled: 'ยกเลิกตามคำขอของลูกค้า',
  };

  return notes[status];
}

function getEmptyBookingForm(date: string, serviceId = '', categoryId = ''): BookingForm {
  return {
    serviceId,
    categoryId,
    date,
    time: '',
    customerName: '',
    phone: '',
    customerNote: '',
    imageUrls: ['', '', '', ''],
  };
}

function getEmptyOpenJobForm(): OpenJobForm {
  return {
    jobItems: '',
    jobImageUrls: ['', '', '', ''],
  };
}

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

function normalizeBooking(booking: Omit<BookingItem, 'dateLabel' | 'note'>): BookingItem {
  return {
    ...booking,
    dateLabel: formatDateLabel(new Date(`${booking.date}T00:00:00`)),
    note: getBookingNote(booking.status),
  };
}

function Pill({
  children,
  color = '#5e421e',
  bgColor = '#f5ddba',
}: {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
}) {
  return (
    <Box
      sx={{
        px: 1.4,
        py: 0.7,
        width: 'fit-content',
        borderRadius: 999,
        color,
        fontSize: 12,
        fontWeight: 800,
        bgcolor: bgColor,
      }}
    >
      {children}
    </Box>
  );
}

function BookingDrawer({
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
}: {
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
}) {
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
        <Stack direction="column" spacing={1} sx={{ pb: 0.5 }}>
          {categories.map((category) => {
            const firstService = services.find((service) => service.categoryId === category.id);
            const isActive = activeCategoryId === category.id;

            return (
              <Button
                key={category.id}
                fullWidth
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() =>
                  onChange({
                    categoryId: category.id,
                    serviceId: firstService?.id ?? '',
                  })
                }
                sx={{
                  minHeight: 48,
                  borderRadius: 1,
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <span>{category.name}</span>
              </Button>
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
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {availableDates.map((date) => (
            <Button
              key={date.id}
              variant={form.date === date.date ? 'contained' : 'outlined'}
              onClick={() => onChange({ date: date.date, time: '' })}
              sx={{ minWidth: 104, borderRadius: 1 }}
            >
              {date.label}
              {getUnavailableDateReason(date) ? ` (${getUnavailableDateReason(date)})` : ''}
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
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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

        <Box sx={{ px: 2.5, pt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {bookingSteps.map((label) => (
              <StepLabel key={label}>{label}</StepLabel>
            ))}
          </Stepper>
        </Box>

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

export function BookingView() {
  const bookingDrawer = useBoolean();
  const queryClient = useQueryClient();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [services, setServices] = useState<SpaService[]>([]);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loadingBookingData, setLoadingBookingData] = useState(true);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<BookingItem | null>(null);
  const [reviewBooking, setReviewBooking] = useState<BookingItem | null>(null);
  const [openJobBooking, setOpenJobBooking] = useState<BookingItem | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [openJobError, setOpenJobError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [bookingForm, setBookingForm] = useState<BookingForm>(() =>
    getEmptyBookingForm(toDateValue(new Date()))
  );
  const [openJobForm, setOpenJobForm] = useState<OpenJobForm>(() => getEmptyOpenJobForm());
  const categoryQuery = useAuthedQuery<{ categories: SpaCategory[] }>({
    queryKey: queryKeys.spaCategories,
    url: endpoints.spaCategories,
  });
  const bookingQuery = useAuthedQuery<BookingApiResponse>({
    queryKey: queryKeys.booking,
    url: endpoints.booking,
  });
  const drawerCategories = useMemo(
    () => categoryQuery.data?.categories ?? [],
    [categoryQuery.data?.categories]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);
  const createBooking = useAuthedMutation<BookingMutationResponse, BookingForm>({
    method: 'post',
    url: endpoints.booking,
  });
  const updateBooking = useAuthedMutation<
    BookingMutationResponse,
    { bookingId: string } & Partial<BookingForm> &
      Partial<OpenJobForm> & {
        status?: BookingStatus;
        reviewRating?: number;
        reviewComment?: string;
      }
  >({
    method: 'patch',
    url: endpoints.booking,
  });

  useEffect(() => {
    setLoadingBookingData(bookingQuery.isLoading || categoryQuery.isLoading);

    if (bookingQuery.error || categoryQuery.error) {
      setPageError(
        bookingQuery.error?.message || categoryQuery.error?.message || 'โหลดข้อมูลการจองไม่สำเร็จ'
      );
      return;
    }

    if (!bookingQuery.data) {
      return;
    }

    const data = bookingQuery.data;
    const normalizedBookings = data.bookings.map(normalizeBooking);
    const firstService = data.services[0];
    const firstDate = data.availability.find((day) => !day.isClosed && day.slots.length)?.date;

    setPageError(null);
    setServices(data.services);
    setAvailability(data.availability);
    setBookings(normalizedBookings);
    setBookingForm((current) => ({
      ...current,
      serviceId: current.serviceId || firstService?.id || '',
      categoryId: current.categoryId || firstService?.categoryId || drawerCategories[0]?.id || '',
      date: firstDate ?? current.date,
      customerName: current.customerName || data.profile.displayName || '',
      phone: current.phone || data.profile.phone || '',
    }));
  }, [
    bookingQuery.data,
    bookingQuery.error,
    bookingQuery.isLoading,
    categoryQuery.error,
    categoryQuery.isLoading,
    drawerCategories,
  ]);

  const statusCounts = useMemo(
    () =>
      statusTabs.reduce(
        (counts, tab) => ({
          ...counts,
          [tab.value]:
            tab.value === 'all'
              ? bookings.length
              : bookings.filter((booking) => booking.status === tab.value).length,
        }),
        {} as Record<StatusFilter, number>
      ),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchService = serviceFilter === 'all' || booking.categoryId === serviceFilter;
      const matchSearch =
        !normalizedQuery ||
        [
          booking.id,
          booking.service,
          booking.dateLabel,
          booking.time,
          booking.note,
          booking.customerName,
          booking.phone,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return matchStatus && matchService && matchSearch;
    });
  }, [bookings, searchQuery, serviceFilter, statusFilter]);

  const handleChangeForm = useCallback((patch: Partial<BookingForm>) => {
    setDrawerError(null);
    setBookingForm((current) => ({ ...current, ...patch }));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingBooking(null);
    setActiveStep(0);
    setDrawerError(null);
    const firstDate = availability.find((day) => !day.isClosed && day.slots.length)?.date ?? '';
    const firstService = services[0];
    setBookingForm((current) => ({
      ...getEmptyBookingForm(
        firstDate,
        firstService?.id ?? '',
        firstService?.categoryId ?? drawerCategories[0]?.id ?? ''
      ),
      customerName: current.customerName,
      phone: current.phone,
    }));
    bookingDrawer.onTrue();
  }, [availability, bookingDrawer, drawerCategories, services]);

  const handleOpenReschedule = useCallback(
    (booking: BookingItem) => {
      setEditingBooking(booking);
      setActiveStep(1);
      setDrawerError(null);
      setBookingForm({
        serviceId: booking.serviceId,
        categoryId: booking.categoryId ?? '',
        date: booking.date,
        time: booking.time,
        customerName: booking.customerName,
        phone: booking.phone,
        customerNote: booking.customerNote,
        imageUrls: [...booking.imageUrls, '', '', '', ''].slice(0, 4),
      });
      bookingDrawer.onTrue();
    },
    [bookingDrawer]
  );

  const validateStep = useCallback(() => {
    if (activeStep === 0 && !bookingForm.categoryId) {
      setDrawerError('กรุณาเลือกประเภทงานทำความสะอาดสินค้า');
      return false;
    }

    if (activeStep === 1 && !bookingForm.time) {
      setDrawerError('กรุณาเลือกเวลาที่ต้องการจอง');
      return false;
    }

    if (activeStep === 2) {
      if (!bookingForm.customerName.trim()) {
        setDrawerError('กรุณากรอกชื่อผู้จอง');
        return false;
      }

      if (!bookingForm.phone.trim()) {
        setDrawerError('กรุณากรอกเบอร์โทรศัพท์');
        return false;
      }
    }

    setDrawerError(null);
    return true;
  }, [
    activeStep,
    bookingForm.categoryId,
    bookingForm.customerName,
    bookingForm.phone,
    bookingForm.time,
  ]);

  const handleNext = useCallback(() => {
    if (!validateStep()) {
      return;
    }

    setActiveStep((current) => Math.min(current + 1, bookingSteps.length - 1));
  }, [validateStep]);

  const handleBack = useCallback(() => {
    setDrawerError(null);
    setActiveStep((current) => Math.max(current - 1, 0));
  }, []);

  const handleSubmitBooking = useCallback(async () => {
    const duplicateBooking = bookings.some(
      (booking) =>
        booking.id !== editingBooking?.id &&
        booking.date === bookingForm.date &&
        booking.time === bookingForm.time &&
        booking.status !== 'cancelled'
    );

    if (duplicateBooking) {
      setDrawerError('เวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาอื่น');
      return;
    }

    try {
      const payload = {
        serviceId: bookingForm.serviceId,
        categoryId: bookingForm.categoryId,
        date: bookingForm.date,
        time: bookingForm.time,
        customerName: bookingForm.customerName,
        phone: bookingForm.phone,
        customerNote: bookingForm.customerNote,
        imageUrls: bookingForm.imageUrls.filter(Boolean).slice(0, 4),
      };

      const data = editingBooking
        ? await updateBooking.mutateAsync({ bookingId: editingBooking.id, ...payload })
        : await createBooking.mutateAsync(payload);

      const nextBooking = normalizeBooking(data.booking);

      setBookings((current) =>
        editingBooking
          ? current.map((booking) => (booking.id === editingBooking.id ? nextBooking : booking))
          : [nextBooking, ...current]
      );
      setSuccessBooking(nextBooking);
      setEditingBooking(null);
      bookingDrawer.onFalse();
      await queryClient.invalidateQueries({ queryKey: queryKeys.booking });
    } catch (error) {
      setDrawerError(error instanceof Error ? error.message : 'บันทึกนัดหมายไม่สำเร็จ');
    }
  }, [
    bookingDrawer,
    bookingForm,
    bookings,
    createBooking,
    editingBooking,
    queryClient,
    updateBooking,
  ]);

  const handleCancelBooking = useCallback(
    async (bookingId: string) => {
      try {
        const data = await updateBooking.mutateAsync({ bookingId, status: 'cancelled' });
        const nextBooking = normalizeBooking(data.booking);

        setBookings((current) =>
          current.map((booking) => (booking.id === bookingId ? nextBooking : booking))
        );
        await queryClient.invalidateQueries({ queryKey: queryKeys.booking });
      } catch (error) {
        setPageError(error instanceof Error ? error.message : 'ยกเลิกนัดหมายไม่สำเร็จ');
      }
    },
    [queryClient, updateBooking]
  );

  const handleOpenJobDialog = useCallback((booking: BookingItem) => {
    setOpenJobBooking(booking);
    setOpenJobError(null);
    setOpenJobForm({
      jobItems: booking.jobItems || '',
      jobImageUrls: [...booking.jobImageUrls, '', '', '', ''].slice(0, 4),
    });
  }, []);

  const handleSubmitOpenJob = useCallback(async () => {
    if (!openJobBooking) {
      return;
    }

    if (!openJobForm.jobItems.trim()) {
      setOpenJobError('กรุณาระบุสินค้าที่จะทำความสะอาด');
      return;
    }

    try {
      const data = await updateBooking.mutateAsync({
        bookingId: openJobBooking.id,
        status: 'in_progress',
        jobItems: openJobForm.jobItems,
        jobImageUrls: openJobForm.jobImageUrls.filter(Boolean).slice(0, 4),
      });
      const nextBooking = normalizeBooking(data.booking);

      setBookings((current) =>
        current.map((booking) => (booking.id === openJobBooking.id ? nextBooking : booking))
      );
      setOpenJobBooking(null);
      setOpenJobError(null);
      setOpenJobForm(getEmptyOpenJobForm());
      await queryClient.invalidateQueries({ queryKey: queryKeys.booking });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.spaBookings('working') });
    } catch (error) {
      setOpenJobError(error instanceof Error ? error.message : 'เปิดงานไม่สำเร็จ');
    }
  }, [openJobBooking, openJobForm, queryClient, updateBooking]);

  const handleCompleteReview = useCallback(async () => {
    if (!reviewBooking) {
      return;
    }

    try {
      const data = await updateBooking.mutateAsync({
        bookingId: reviewBooking.id,
        reviewRating: 5,
        reviewComment: '',
      });
      const nextBooking = normalizeBooking(data.booking);

      setBookings((current) =>
        current.map((booking) => (booking.id === reviewBooking.id ? nextBooking : booking))
      );
      setReviewBooking(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.booking });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'บันทึกรีวิวไม่สำเร็จ');
    }
  }, [queryClient, reviewBooking, updateBooking]);

  return (
    <Box
      component="main"
      sx={{
        color: '#111',
        minHeight: '100vh',
        bgcolor: '#f8f2e9',
        fontFamily: "'LINE Seed Sans TH', sans-serif",
      }}
    >
      <Box
        sx={{
          pt: { xs: 14, md: 17 },
          pb: { xs: 6, md: 8 },
          bgcolor: '#f8f2e9',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ md: 'flex-end' }}
            justifyContent="space-between"
          >
            <Stack spacing={2.4} sx={{ maxWidth: 760 }}>
              <Pill>เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว</Pill>
              <Typography
                component="h1"
                sx={{
                  color: '#050505',
                  fontSize: { xs: 44, sm: 62, md: 82 },
                  fontWeight: 950,
                  lineHeight: 0.98,
                  letterSpacing: 0,
                }}
              >
                นัดหมายของฉัน
              </Typography>
              <Typography sx={{ color: '#313936', maxWidth: 600, fontSize: 17, lineHeight: 1.8 }}>
                จองคิวทำความสะอาดสินค้า เลือกวันเวลา ตรวจสอบคิวว่าง
                และจัดการนัดหมายได้ครบในหน้าเดียว
              </Typography>
            </Stack>

            <Button
              size="large"
              variant="contained"
              onClick={handleOpenCreate}
              disabled={loadingBookingData || !services.length || !drawerCategories.length}
              startIcon={<Iconify icon="solar:calendar-date-bold" />}
              sx={{ height: 52, borderRadius: 999, bgcolor: '#101513', px: 3 }}
            >
              จองคิว
            </Button>
          </Stack>

          <Box
            sx={{
              mt: 10,
              overflow: 'hidden',
              borderRadius: 1,
              bgcolor: '#fff',
              border: '1px solid rgba(44, 49, 45, 0.08)',
              boxShadow: '0 22px 70px rgba(45, 55, 50, 0.08)',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ md: 'flex-end' }}
              justifyContent="space-between"
              sx={{ p: { xs: 2, md: 3 } }}
            >
              <Box>
                <Typography sx={{ color: '#8a5b26', fontSize: 13, fontWeight: 900 }}>
                  นัดหมายของฉัน
                </Typography>
                <Typography
                  component="h2"
                  sx={{ mt: 1, color: '#101513', fontSize: { xs: 30, md: 40 }, fontWeight: 950 }}
                >
                  รายการนัดหมาย
                </Typography>
                <Typography sx={{ mt: 1, color: '#64706b', lineHeight: 1.8 }}>
                  แยกสถานะการนัดหมายชัดเจน พร้อมค้นหาและกรองบริการได้ทันที
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1.6,
                  py: 1.1,
                  borderRadius: 1,
                  bgcolor: '#f8f2e9',
                  border: '1px solid rgba(44, 49, 45, 0.08)',
                }}
              >
                <Typography sx={{ color: '#64706b', fontSize: 12, fontWeight: 800 }}>
                  แสดงผล
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 950 }}>
                  {filteredBookings.length}/{bookings.length}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Tabs
              value={statusFilter}
              onChange={(_, value: StatusFilter) => setStatusFilter(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: { xs: 1, md: 2 },
                '& .MuiTab-root': { minHeight: 56, fontWeight: 800 },
              }}
            >
              {statusTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={`${tab.label} (${statusCounts[tab.value]})`}
                />
              ))}
            </Tabs>

            <Divider />

            {pageError && (
              <Alert severity="error" sx={{ mx: { xs: 2, md: 3 }, mt: 2 }}>
                {pageError}
              </Alert>
            )}

            <Box
              sx={{
                p: { xs: 2, md: 3 },
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', md: '1fr 240px' },
              }}
            >
              <TextField
                fullWidth
                value={searchQuery}
                placeholder="ค้นหาประเภท วันที่ เวลา หรือเลขจอง"
                onChange={(event) => setSearchQuery(event.target.value)}
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

              <TextField
                select
                fullWidth
                value={serviceFilter}
                label="ประเภท"
                onChange={(event) => setServiceFilter(event.target.value)}
              >
                <MenuItem value="all">ทุกประเภท</MenuItem>
                {drawerCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Stack spacing={1.5} sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
              {filteredBookings.map((booking) => {
                const meta = statusMeta[booking.status];
                const canManage = ['pending', 'confirmed'].includes(booking.status);
                const canOpenJob = canOpenBookingJob(booking, nowMs);

                return (
                  <Box
                    key={booking.id}
                    sx={{
                      p: { xs: 2, md: 2.5 },
                      borderRadius: 1,
                      bgcolor: '#fbfdfb',
                      border: '1px solid rgba(44, 49, 45, 0.08)',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      alignItems={{ md: 'center' }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            display: 'grid',
                            flexShrink: 0,
                            borderRadius: 1,
                            color: '#8a5b26',
                            placeItems: 'center',
                            bgcolor: '#f8f2e9',
                          }}
                        >
                          <Iconify width={28} icon="solar:calendar-date-bold" />
                        </Box>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography sx={{ fontSize: 18, fontWeight: 950 }}>
                              {booking.service}
                            </Typography>
                            <Pill color={meta.color} bgColor={meta.bgColor}>
                              {meta.label}
                            </Pill>
                          </Stack>
                          <Typography sx={{ mt: 0.5, color: '#64706b', fontSize: 14 }}>
                            {booking.id} • {booking.dateLabel} เวลา {booking.time}
                          </Typography>
                          <Typography sx={{ mt: 0.6, color: '#7a6a58', fontSize: 13 }}>
                            {booking.duration} • {booking.price.toLocaleString()} บาท •{' '}
                            {booking.note}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!canManage}
                          onClick={() => handleOpenReschedule(booking)}
                          startIcon={<Iconify icon="solar:calendar-date-bold" />}
                          sx={{ borderRadius: 999 }}
                        >
                          เลื่อนนัด
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!canOpenJob}
                          onClick={() => handleOpenJobDialog(booking)}
                          startIcon={<Iconify icon="solar:play-circle-bold" />}
                          sx={{ borderRadius: 999, bgcolor: '#101513' }}
                        >
                          เปิดงาน
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={!canManage}
                          onClick={() => handleCancelBooking(booking.id)}
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                          sx={{ borderRadius: 999 }}
                        >
                          ยกเลิก
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={booking.status !== 'completed'}
                          onClick={() => setReviewBooking(booking)}
                          startIcon={<Iconify icon="solar:cup-star-bold" />}
                          sx={{ borderRadius: 999 }}
                        >
                          รีวิว
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}

              {loadingBookingData && (
                <Box
                  sx={{
                    py: 6,
                    px: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    bgcolor: '#fbfdfb',
                    border: '1px dashed rgba(44, 49, 45, 0.2)',
                  }}
                >
                  <Iconify width={42} icon="solar:calendar-date-bold" />
                  <Typography sx={{ mt: 1, fontWeight: 900 }}>กำลังโหลดนัดหมาย</Typography>
                </Box>
              )}

              {!loadingBookingData && !filteredBookings.length && (
                <Box
                  sx={{
                    py: 6,
                    px: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    bgcolor: '#fbfdfb',
                    border: '1px dashed rgba(44, 49, 45, 0.2)',
                  }}
                >
                  <Iconify width={42} icon="solar:calendar-date-bold" />
                  <Typography sx={{ mt: 1, fontWeight: 900 }}>ไม่พบนัดหมาย</Typography>
                  <Typography sx={{ mt: 0.5, color: '#64706b' }}>
                    ลองเปลี่ยนสถานะหรือคำค้นหาใหม่อีกครั้ง
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      <BookingDrawer
        open={bookingDrawer.value}
        form={bookingForm}
        activeStep={activeStep}
        bookings={bookings}
        categories={drawerCategories}
        services={services}
        editingBooking={editingBooking}
        availableDates={availability}
        errorMessage={drawerError}
        onClose={bookingDrawer.onFalse}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmitBooking}
        onChange={handleChangeForm}
      />

      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!openJobBooking}
        onClose={() => setOpenJobBooking(null)}
      >
        <DialogTitle>เปิดงานทำความสะอาดสินค้า</DialogTitle>
        <DialogContent>
          {openJobBooking && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info">
                ส่งรายละเอียดสินค้าที่จะทำความสะอาดให้ร้านตรวจสอบก่อนเริ่มงาน
              </Alert>
              {openJobError && <Alert severity="error">{openJobError}</Alert>}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: '#f8f2e9',
                  border: '1px solid rgba(44, 49, 45, 0.08)',
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{openJobBooking.service}</Typography>
                <Typography sx={{ mt: 0.5, color: '#64706b', fontSize: 14 }}>
                  {openJobBooking.bookingNo} • {openJobBooking.dateLabel} เวลา {openJobBooking.time}
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="สินค้าที่จะทำความสะอาด"
                placeholder="เช่น ชื่อสินค้า รุ่น วัสดุ คราบหรือจุดที่ต้องดูแลเป็นพิเศษ"
                value={openJobForm.jobItems}
                onChange={(event) => {
                  setOpenJobError(null);
                  setOpenJobForm((current) => ({ ...current, jobItems: event.target.value }));
                }}
              />
              <Box>
                <Typography sx={{ mb: 1, fontWeight: 900 }}>รูปภาพสินค้า (สูงสุด 4 รูป)</Typography>
                <Stack spacing={1}>
                  {openJobForm.jobImageUrls.map((imageUrl, index) => (
                    <TextField
                      key={index}
                      fullWidth
                      label={`URL รูปภาพสินค้า ${index + 1}`}
                      value={imageUrl}
                      onChange={(event) => {
                        const nextImageUrls = [...openJobForm.jobImageUrls];

                        nextImageUrls[index] = event.target.value;
                        setOpenJobForm((current) => ({
                          ...current,
                          jobImageUrls: nextImageUrls,
                        }));
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenJobBooking(null)}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitOpenJob}
            startIcon={<Iconify icon="solar:play-circle-bold" />}
          >
            เปิดงาน
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={!!successBooking}
        onClose={() => setSuccessBooking(null)}
      >
        <DialogTitle>จองคิวสำเร็จ</DialogTitle>
        <DialogContent>
          {successBooking && (
            <Stack spacing={1.2}>
              <Alert severity="success">ระบบบันทึกนัดหมายเรียบร้อยแล้ว</Alert>
              <Typography sx={{ fontWeight: 900 }}>{successBooking.service}</Typography>
              <Typography sx={{ color: '#64706b' }}>
                {successBooking.id} • {successBooking.dateLabel} เวลา {successBooking.time}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSuccessBooking(null)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="xs" open={!!reviewBooking} onClose={() => setReviewBooking(null)}>
        <DialogTitle>รีวิวบริการ</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Typography sx={{ color: '#64706b' }}>
              ให้คะแนนและบันทึกการใช้บริการสำหรับ {reviewBooking?.service}
            </Typography>
            <TextField select label="คะแนน" defaultValue="5">
              {[5, 4, 3, 2, 1].map((score) => (
                <MenuItem key={score} value={score}>
                  {score} ดาว
                </MenuItem>
              ))}
            </TextField>
            <TextField multiline minRows={3} label="ความคิดเห็น" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setReviewBooking(null)}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={handleCompleteReview}>
            บันทึกรีวิว
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
