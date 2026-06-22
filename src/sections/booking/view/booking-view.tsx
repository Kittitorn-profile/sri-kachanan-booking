'use client';

import type React from 'react';

import { useMemo, useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

const services = ['นวดน้ำมันคชานัน', 'พิธีผิวใสสมุนไพร', 'แช่เท้าดอกบัวและประคบ'];

const staff = ['ดาว', 'น้ำ', 'เมย์'];

type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

type StatusFilter = 'all' | BookingStatus;

type BookingItem = {
  id: string;
  service: string;
  date: string;
  time: string;
  staff: string;
  status: BookingStatus;
  note: string;
};

const bookingHistory: BookingItem[] = [
  {
    id: 'BK-240624-01',
    service: 'นวดน้ำมันคชานัน',
    date: '24 มิ.ย. 2026',
    time: '14:30',
    staff: 'ดาว',
    status: 'confirmed',
    note: 'ยืนยันแล้ว รอเข้ารับบริการ',
  },
  {
    id: 'BK-300624-02',
    service: 'พิธีผิวใสสมุนไพร',
    date: '30 มิ.ย. 2026',
    time: '11:30',
    staff: 'น้ำ',
    status: 'pending',
    note: 'รอชำระเงินเพื่อยืนยันคิว',
  },
  {
    id: 'BK-120626-03',
    service: 'แช่เท้าดอกบัวและประคบ',
    date: '12 มิ.ย. 2026',
    time: '16:00',
    staff: 'เมย์',
    status: 'completed',
    note: 'ใช้บริการแล้ว สามารถให้คะแนนได้',
  },
  {
    id: 'BK-050626-04',
    service: 'นวดน้ำมันคชานัน',
    date: '5 มิ.ย. 2026',
    time: '10:00',
    staff: 'ดาว',
    status: 'cancelled',
    note: 'ยกเลิกตามคำขอของลูกค้า',
  },
];

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'pending', label: 'รอชำระเงิน' },
  { value: 'completed', label: 'ใช้บริการแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

const statusMeta: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
  confirmed: { label: 'ยืนยันแล้ว', color: '#1f6f4a', bgColor: '#dff4e7' },
  pending: { label: 'รอชำระเงิน', color: '#8a5b26', bgColor: '#f5ddba' },
  completed: { label: 'ใช้บริการแล้ว', color: '#315a8f', bgColor: '#dfeafa' },
  cancelled: { label: 'ยกเลิก', color: '#9b2f2f', bgColor: '#fde2df' },
};

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

function BookingDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: 1, sm: 460 },
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
            <Typography sx={{ fontSize: 24, fontWeight: 950 }}>จองคิว</Typography>
            <Typography sx={{ mt: 0.5, color: '#65716b', fontSize: 14 }}>
              เลือกบริการ วัน เวลา และพนักงานที่ต้องการ
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <Divider />

        <Stack spacing={2.5} sx={{ p: 2.5, overflowY: 'auto' }}>
          <Box>
            <Typography sx={{ mb: 1.2, fontWeight: 900 }}>บริการ</Typography>
            <Stack spacing={1}>
              {services.map((service, index) => (
                <Button
                  key={service}
                  fullWidth
                  variant={index === 0 ? 'contained' : 'outlined'}
                  sx={{ height: 48, justifyContent: 'flex-start', borderRadius: 1 }}
                >
                  {service}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ mb: 1.2, fontWeight: 900 }}>วันที่</Typography>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
              {['24 มิ.ย.', '25 มิ.ย.', '26 มิ.ย.', '27 มิ.ย.'].map((date, index) => (
                <Button
                  key={date}
                  variant={index === 0 ? 'contained' : 'outlined'}
                  sx={{ minWidth: 104, borderRadius: 1 }}
                >
                  {date}
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
              {timeSlots.map((time, index) => (
                <Button
                  key={time}
                  disabled={index === 2}
                  variant={index === 3 ? 'contained' : 'outlined'}
                  startIcon={<Iconify icon="solar:clock-circle-bold" />}
                  sx={{ height: 48, borderRadius: 1 }}
                >
                  {time}
                </Button>
              ))}
            </Box>
            <Typography sx={{ mt: 1.2, color: '#7a6a58', fontSize: 13 }}>
              เวลา 13:00 ถูกจองแล้ว ระบบจะไม่อนุญาตให้จองซ้ำในรอบเดียวกัน
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ mb: 1.2, fontWeight: 900 }}>พนักงาน</Typography>
            <Stack direction="row" spacing={1}>
              {staff.map((name, index) => (
                <Button
                  key={name}
                  fullWidth
                  variant={index === 0 ? 'contained' : 'outlined'}
                  sx={{ height: 44, borderRadius: 1 }}
                >
                  {name}
                </Button>
              ))}
            </Stack>
          </Box>

          <Stack spacing={1.5}>
            {['ชื่อ-นามสกุล', 'เบอร์โทรศัพท์'].map((label) => (
              <Box
                key={label}
                sx={{
                  px: 1.6,
                  height: 50,
                  display: 'flex',
                  borderRadius: 1,
                  color: '#7a8580',
                  alignItems: 'center',
                  bgcolor: '#fff',
                  border: '1px solid #e4ebe6',
                }}
              >
                {label}
              </Box>
            ))}
            <Box
              sx={{
                p: 1.6,
                minHeight: 84,
                borderRadius: 1,
                color: '#7a8580',
                bgcolor: '#fff',
                border: '1px solid #e4ebe6',
              }}
            >
              หมายเหตุถึงร้าน
            </Box>
          </Stack>
        </Stack>

        <Box sx={{ p: 2.5, mt: 'auto', bgcolor: '#fff', borderTop: '1px solid #e4ebe6' }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            sx={{ height: 52, borderRadius: 999, bgcolor: '#101513' }}
          >
            ยืนยันการจอง
          </Button>
        </Box>
      </Stack>
    </Drawer>
  );
}

export function BookingView() {
  const bookingDrawer = useBoolean();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusCounts = useMemo(
    () =>
      statusTabs.reduce(
        (counts, tab) => ({
          ...counts,
          [tab.value]:
            tab.value === 'all'
              ? bookingHistory.length
              : bookingHistory.filter((booking) => booking.status === tab.value).length,
        }),
        {} as Record<StatusFilter, number>
      ),
    []
  );

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bookingHistory.filter((booking) => {
      const matchStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchService = serviceFilter === 'all' || booking.service === serviceFilter;
      const matchSearch =
        !normalizedQuery ||
        [booking.id, booking.service, booking.date, booking.time, booking.staff, booking.note]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return matchStatus && matchService && matchSearch;
    });
  }, [searchQuery, serviceFilter, statusFilter]);

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
                ดูสถานะนัดหมายล่าสุด เลื่อนนัด ยกเลิก หรือเปิด drawer เพื่อจองคิวใหม่
              </Typography>
            </Stack>

            <Button
              size="large"
              variant="contained"
              onClick={bookingDrawer.onTrue}
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
                  {filteredBookings.length}/{bookingHistory.length}
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
                placeholder="ค้นหาบริการ วันที่ เวลา พนักงาน หรือเลขจอง"
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
                label="บริการ"
                onChange={(event) => setServiceFilter(event.target.value)}
              >
                <MenuItem value="all">ทุกบริการ</MenuItem>
                {services.map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Stack spacing={1.5} sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
              {filteredBookings.map((booking) => {
                const meta = statusMeta[booking.status];

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
                            {booking.id} • {booking.date} เวลา {booking.time} • พนักงาน{' '}
                            {booking.staff}
                          </Typography>
                          <Typography sx={{ mt: 0.6, color: '#7a6a58', fontSize: 13 }}>
                            {booking.note}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="solar:calendar-date-bold" />}
                          sx={{ borderRadius: 999 }}
                        >
                          เลื่อนนัด
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                          sx={{ borderRadius: 999 }}
                        >
                          ยกเลิก
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
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

              {!filteredBookings.length && (
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

      <BookingDrawer open={bookingDrawer.value} onClose={bookingDrawer.onFalse} />
    </Box>
  );
}
