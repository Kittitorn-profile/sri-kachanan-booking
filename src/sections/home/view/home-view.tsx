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
          mb: { xs: -9, md: -12 },
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
              'linear-gradient(180deg, rgba(250,246,237,0.68) 0%, rgba(250,246,237,0.2) 38%, rgba(248,242,233,0.72) 74%, #f8f2e9 100%)',
          }}
        />

        <Box
          sx={{
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            height: { xs: 220, md: 300 },
            position: 'absolute',
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, rgba(248,242,233,0) 0%, rgba(248,242,233,0.72) 42%, #f8f2e9 88%)',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            zIndex: 2,
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
                href="/booking"
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

      <Box
        id="services"
        sx={{
          pt: { xs: 17, md: 24 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          bgcolor: '#f8f2e9',
        }}
      >
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
                    <Button href="/booking" variant="contained" sx={{ borderRadius: 999 }}>
                      เลือกบริการ
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
