'use client';

import type React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const services = [
  {
    title: 'นวดน้ำมันคชานัน',
    duration: '90 นาที',
    price: '2,400',
    tag: 'แนะนำ',
    body: 'นวดน้ำมันทั่วร่างกายพร้อมจังหวะหายใจ ช่วยคลายออฟฟิศซินโดรมและเติมความสงบ',
    image: '/assets/spa/aroma-oil.png',
  },
  {
    title: 'พิธีผิวใสสมุนไพร',
    duration: '75 นาที',
    price: '1,900',
    tag: 'ขายดี',
    body: 'สครับ สมุนไพรอุ่น และมาสก์ดอกบัว เหมาะกับผู้ต้องการฟื้นผิวก่อนวันสำคัญ',
    image: '/assets/spa/facial-ritual.png',
  },
  {
    title: 'แช่เท้าดอกบัวและประคบ',
    duration: '60 นาที',
    price: '1,500',
    tag: 'ผ่อนคลาย',
    body: 'แช่เท้าในน้ำสมุนไพร ตามด้วยประคบอุ่นและนวดกดจุดเบา ๆ เพื่อลดความล้า',
    image: '/assets/spa/herbal-soak.png',
  },
];

const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

const bookingHistory = [
  { service: 'นวดน้ำมันคชานัน', date: '24 มิ.ย. 2026', time: '14:30', status: 'ยืนยันแล้ว' },
  { service: 'พิธีผิวใสสมุนไพร', date: '30 มิ.ย. 2026', time: '11:30', status: 'รอชำระเงิน' },
];

const reviews = [
  'จองง่าย เลือกเวลาได้ชัดเจน พนักงานโทรยืนยันเร็วมาก',
  'บริการละเอียด บรรยากาศสงบ และประวัติการจองดูย้อนหลังได้สะดวก',
  'เลื่อนนัดผ่านมือถือได้ ไม่ต้องโทรหลายรอบ เหมาะกับลูกค้าประจำ',
];

function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <Stack spacing={1.2} sx={{ mb: { xs: 3.5, md: 5 }, maxWidth: 720 }}>
      <Typography sx={{ color: '#8a5b26', fontSize: 13, fontWeight: 900 }}>{eyebrow}</Typography>
      <Typography
        component="h2"
        sx={{
          color: '#101513',
          fontSize: { xs: 32, md: 46 },
          fontWeight: 950,
          lineHeight: 1.08,
          letterSpacing: 0,
        }}
      >
        {title}
      </Typography>
      {body && (
        <Typography sx={{ color: '#64706b', lineHeight: 1.8 }}>{body}</Typography>
      )}
    </Stack>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        px: 1.4,
        py: 0.7,
        width: 'fit-content',
        borderRadius: 999,
        color: '#5e421e',
        fontSize: 12,
        fontWeight: 800,
        bgcolor: '#f5ddba',
      }}
    >
      {children}
    </Box>
  );
}

export function HomeView() {
  return (
    <Box
      component="main"
      sx={{
        color: '#111',
        overflow: 'hidden',
        bgcolor: '#f8f2e9',
        fontFamily: "'LINE Seed Sans TH', sans-serif",
      }}
    >
      <Box
        id="home"
        sx={{
          minHeight: { xs: 720, md: 820 },
          position: 'relative',
          bgcolor: '#f8f2e9',
        }}
      >
        <Image
          visibleByDefault
          disablePlaceholder
          alt="Sri Kachanan spa hero"
          src="/assets/spa/hero-ganesha.png"
          sx={{
            inset: 0,
            width: 1,
            height: 1,
            position: 'absolute',
            '& img': {
              objectFit: 'cover',
              objectPosition: { xs: '58% 50%', md: '50% 20%' },
            },
          }}
        />

        <Box
          sx={{
            inset: 0,
            position: 'absolute',
            background:
              'linear-gradient(180deg, rgba(250,246,237,0.66) 0%, rgba(250,246,237,0.16) 44%, rgba(248,242,233,0.94) 100%)',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            zIndex: 1,
            height: 1,
            minHeight: { xs: 720, md: 820 },
            display: 'flex',
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'center',
            pt: { xs: 11, md: 13 },
            pb: { xs: 5, md: 7 },
          }}
        >
          <Stack spacing={2.5} sx={{ maxWidth: 650 }}>
            <Pill>โปรโมชั่นเปิดระบบจองออนไลน์ ลด 20% ถึงสิ้นเดือน</Pill>
            <Typography
              component="h1"
              sx={{
                color: '#050505',
                fontSize: { xs: 52, sm: 74, md: 104 },
                fontWeight: 950,
                lineHeight: 0.92,
                letterSpacing: 0,
              }}
            >
              ศรีคชานัน
            </Typography>
            <Typography
              component="h1"
              sx={{
                color: '#050505',
                fontSize: { xs: 52, sm: 74, md: 104 },
                fontWeight: 950,
                lineHeight: 0.92,
                letterSpacing: 0,
              }}
            >
              คายะตรีมันตรา
            </Typography>
            <Typography sx={{ color: '#313936', maxWidth: 520, fontSize: 17, lineHeight: 1.8 }}>
              UI ระบบจองสปาครบเส้นทาง ตั้งแต่เลือกบริการ เลือกวันเวลา จองคิว ดูประวัติ เลื่อนนัด
              รีวิว ไปจนถึงแดชบอร์ดหลังบ้านสำหรับทีมงาน
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                size="large"
                href="#booking"
                variant="contained"
                startIcon={<Iconify icon="solar:calendar-date-bold" />}
                sx={{ borderRadius: 999, bgcolor: '#101513' }}
              >
                จองคิวออนไลน์
              </Button>
              <Button
                size="large"
                href="#services"
                variant="outlined"
                startIcon={<Iconify icon="solar:tea-cup-bold" />}
                sx={{ borderRadius: 999, color: '#101513', borderColor: '#101513' }}
              >
                ดูบริการแนะนำ
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box id="services" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f2e9' }}>
        <Container maxWidth="lg">
          <SectionTitle
            eyebrow="บริการสปา"
            title="รายการบริการและรายละเอียดสำหรับลูกค้า"
            body="ออกแบบเป็นการ์ดที่อ่านง่ายบนมือถือ มีราคา ระยะเวลา ป้ายโปรโมชัน และปุ่มเข้าสู่การจอง"
          />

          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            {services.map((service) => (
              <Box
                key={service.title}
                sx={{
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: '#fff',
                  border: '1px solid rgba(44, 49, 45, 0.08)',
                  boxShadow: '0 18px 50px rgba(45, 55, 50, 0.08)',
                }}
              >
                <Image alt={service.title} src={service.image} ratio="4/3" />
                <Stack spacing={1.4} sx={{ p: 2.5 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Pill>{service.tag}</Pill>
                    <Typography sx={{ color: '#8a7b68', fontSize: 13 }}>
                      {service.duration}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 20, fontWeight: 950 }}>{service.title}</Typography>
                  <Typography sx={{ color: '#68736e', minHeight: 74, lineHeight: 1.7 }}>
                    {service.body}
                  </Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontSize: 24, fontWeight: 900 }}>฿{service.price}</Typography>
                    <Button href="#booking" variant="contained" sx={{ borderRadius: 999 }}>
                      เลือกบริการ
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        id="booking"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#eef3ef',
          borderTop: '1px solid rgba(44, 49, 45, 0.08)',
          borderBottom: '1px solid rgba(44, 49, 45, 0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 3, md: 4 },
              alignItems: 'start',
              gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
            }}
          >
            <Box>
              <SectionTitle
                eyebrow="เลือกวันและเวลา"
                title="ป้องกันการจองเวลาซ้ำด้วยตารางเวลาว่าง"
                body="ตัวอย่าง UI แสดงวันที่ เลือกพนักงาน เลือกช่วงเวลา และแจ้งเตือนเวลาที่ถูกจองแล้วก่อนกดยืนยัน"
              />
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: '#fff',
                  border: '1px solid rgba(44, 49, 45, 0.08)',
                }}
              >
                <Stack direction="row" spacing={1.2} sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}>
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
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
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
                <Typography sx={{ mt: 2, color: '#7a6a58', fontSize: 13 }}>
                  เวลา 13:00 ถูกจองแล้ว ระบบจะไม่อนุญาตให้จองซ้ำในรอบเดียวกัน
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 1,
                bgcolor: '#fff',
                border: '1px solid rgba(44, 49, 45, 0.08)',
                boxShadow: '0 22px 60px rgba(45, 55, 50, 0.1)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2.5 }}>
                <Iconify width={28} icon="solar:bill-list-bold-duotone" />
                <Typography sx={{ fontSize: 22, fontWeight: 950 }}>จองคิวออนไลน์</Typography>
              </Stack>
              <Stack spacing={1.5}>
                {['ชื่อ-นามสกุล', 'เบอร์โทรศัพท์', 'เลือกบริการ', 'เลือกพนักงาน'].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      px: 1.6,
                      height: 50,
                      display: 'flex',
                      borderRadius: 1,
                      color: '#7a8580',
                      alignItems: 'center',
                      bgcolor: '#f7faf8',
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
                    bgcolor: '#f7faf8',
                    border: '1px solid #e4ebe6',
                  }}
                >
                  หมายเหตุถึงร้าน
                </Box>
                <Button
                  size="large"
                  variant="contained"
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  sx={{ height: 52, borderRadius: 999, bgcolor: '#101513' }}
                >
                  ยืนยันการจอง
                </Button>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box id="account" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8f2e9' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <Box>
              <SectionTitle
                eyebrow="บัญชีลูกค้า"
                title="ประวัติการจอง เลื่อนนัด ยกเลิก และรีวิวบริการ"
              />
              <Stack spacing={1.5}>
                {bookingHistory.map((booking) => (
                  <Box
                    key={`${booking.service}-${booking.time}`}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: '#fff',
                      border: '1px solid rgba(44, 49, 45, 0.08)',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{booking.service}</Typography>
                        <Typography sx={{ color: '#6f7a75', fontSize: 14 }}>
                          {booking.date} เวลา {booking.time}
                        </Typography>
                      </Box>
                      <Pill>{booking.status}</Pill>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Button size="small" variant="outlined" sx={{ borderRadius: 999 }}>
                        เลื่อนนัด
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ borderRadius: 999 }}
                      >
                        ยกเลิก
                      </Button>
                      <Button size="small" variant="contained" sx={{ borderRadius: 999 }}>
                        รีวิว
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <SectionTitle eyebrow="สมาชิก" title="สมัครสมาชิก / เข้าสู่ระบบ" />
              <Box
                sx={{
                  p: 3,
                  borderRadius: 1,
                  bgcolor: '#101513',
                  color: '#fff',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography sx={{ fontSize: 24, fontWeight: 950 }}>
                    เข้าสู่ระบบเพื่อจัดการนัดหมาย
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
                    ลูกค้าสามารถดูคิวล่าสุด รับคูปองส่วนตัว บันทึกบริการโปรด
                    และให้คะแนนหลังรับบริการ
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: '#f5ddba', color: '#101513' }}
                    >
                      เข้าสู่ระบบ
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ color: '#fff', borderColor: '#fff' }}
                    >
                      สมัครสมาชิก
                    </Button>
                  </Stack>
                </Stack>
              </Box>
              <Stack spacing={1.2} sx={{ mt: 2 }}>
                {reviews.map((review) => (
                  <Box key={review} sx={{ p: 2, borderRadius: 1, bgcolor: '#fff' }}>
                    <Stack direction="row" spacing={0.5} sx={{ color: '#c9802f', mb: 0.8 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Iconify key={star} icon="solar:cup-star-bold" />
                      ))}
                    </Stack>
                    <Typography sx={{ color: '#5f6a65', lineHeight: 1.7 }}>{review}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
