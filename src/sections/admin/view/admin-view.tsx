'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const stats = [
  { label: 'ยอดจองวันนี้', value: '18', icon: 'solar:calendar-date-bold', color: '#2f7d54' },
  { label: 'รายได้เดือนนี้', value: '142K', icon: 'solar:wad-of-money-bold', color: '#8a5b26' },
  {
    label: 'ลูกค้าใหม่',
    value: '36',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: '#3d61a8',
  },
  { label: 'คิวว่าง', value: '9', icon: 'solar:clock-circle-bold', color: '#8c4f9f' },
] as const;

const bookings = [
  ['10:00', 'คุณมินตรา', 'นวดน้ำมันคชานัน', 'พนักงาน: ดาว', 'ยืนยันแล้ว'],
  ['11:30', 'คุณอร', 'พิธีผิวใสสมุนไพร', 'พนักงาน: น้ำ', 'รอชำระเงิน'],
  ['14:30', 'คุณภาคิน', 'แช่เท้าดอกบัวและประคบ', 'พนักงาน: เมย์', 'ยืนยันแล้ว'],
  ['16:00', 'คุณกานต์', 'นวดน้ำมันคชานัน', 'พนักงาน: ดาว', 'เลื่อนนัด'],
];

const services = [
  ['นวดน้ำมันคชานัน', '90 นาที', '2,400 บาท', 'เปิดขาย'],
  ['พิธีผิวใสสมุนไพร', '75 นาที', '1,900 บาท', 'เปิดขาย'],
  ['แช่เท้าดอกบัวและประคบ', '60 นาที', '1,500 บาท', 'เปิดขาย'],
];

const staff = [
  ['ดาว', 'นวดน้ำมัน', '5 คิววันนี้'],
  ['น้ำ', 'ดูแลผิว', '4 คิววันนี้'],
  ['เมย์', 'ประคบสมุนไพร', '3 คิววันนี้'],
];

const customers = [
  ['คุณมินตรา', 'ลูกค้าประจำ', '12 ครั้ง', 'คูปองวันเกิด'],
  ['คุณอร', 'สมาชิกใหม่', '2 ครั้ง', 'ติดตามชำระเงิน'],
  ['คุณภาคิน', 'ลูกค้าประจำ', '8 ครั้ง', 'ชอบรอบบ่าย'],
];

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        width: 'fit-content',
        borderRadius: 999,
        typography: 'caption',
        fontWeight: 700,
        color: 'success.darker',
        bgcolor: 'success.lighter',
      }}
    >
      {children}
    </Box>
  );
}

function AdminTable({
  title,
  id,
  rows,
  columns,
}: {
  title: string;
  id: string;
  rows: string[][];
  columns: string[];
}) {
  return (
    <Card id={id}>
      <CardHeader
        title={title}
        action={
          <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:pen-bold" />}>
            จัดการ
          </Button>
        }
      />
      <CardContent>
        <Box
          sx={{
            mb: 1,
            display: { xs: 'none', md: 'grid' },
            gap: 2,
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column) => (
            <Typography key={column} variant="caption" sx={{ color: 'text.secondary' }}>
              {column}
            </Typography>
          ))}
        </Box>
        <Stack divider={<Divider flexItem />} spacing={0}>
          {rows.map((row) => (
            <Box
              key={row.join('-')}
              sx={{
                py: 1.5,
                display: 'grid',
                gap: { xs: 0.75, md: 2 },
                gridTemplateColumns: { xs: '1fr', md: `repeat(${columns.length}, minmax(0, 1fr))` },
              }}
            >
              {row.map((cell, index) => (
                <Typography
                  key={`${cell}-${index}`}
                  variant="body2"
                  sx={{ color: index === 0 ? 'text.primary' : 'text.secondary' }}
                >
                  {cell}
                </Typography>
              ))}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function AdminView() {
  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">ระบบหลังบ้าน</Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary' }}>
            จัดการยอดจอง บริการ พนักงาน ลูกค้า โปรโมชั่น และรายงานรายได้
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Iconify icon="solar:download-bold" />}>
            ส่งออกรายงาน
          </Button>
          <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>
            เพิ่มการจอง
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  display: 'grid',
                  borderRadius: 1,
                  color: stat.color,
                  placeItems: 'center',
                  bgcolor: 'background.neutral',
                }}
              >
                <Iconify width={26} icon={stat.icon} />
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: '1.35fr 0.65fr' },
        }}
      >
        <Card>
          <CardHeader
            title="Dashboard สรุปยอดจอง"
            subheader="ตารางวันนี้ พร้อมสถานะและการกันเวลาซ้ำ"
            action={<StatusPill>ป้องกันจองเวลาซ้ำ</StatusPill>}
          />
          <CardContent>
            <Stack divider={<Divider flexItem />}>
              {bookings.map((row) => (
                <Box
                  key={row.join('-')}
                  sx={{
                    py: 1.5,
                    display: 'grid',
                    gap: 1.5,
                    alignItems: 'center',
                    gridTemplateColumns: { xs: '1fr', md: '80px 1fr 1.25fr 1fr 110px' },
                  }}
                >
                  {row.map((cell, index) =>
                    index === 4 ? (
                      <StatusPill key={cell}>{cell}</StatusPill>
                    ) : (
                      <Typography key={cell} variant="body2">
                        {cell}
                      </Typography>
                    )
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card id="promotions">
          <CardHeader title="โปรโมชั่น / คูปอง" subheader="แคมเปญที่กำลังใช้งาน" />
          <CardContent>
            <Stack spacing={1.5}>
              {['ลด 20% สำหรับจองออนไลน์', 'คูปองวันเกิดสมาชิก', 'แพ็กเกจคู่รักวันธรรมดา'].map(
                (promotion) => (
                  <Box
                    key={promotion}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      borderRadius: 1,
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Iconify icon="solar:tag-horizontal-bold-duotone" />
                    <Typography variant="body2">{promotion}</Typography>
                  </Box>
                )
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        <AdminTable
          id="services"
          title="จัดการบริการสปา"
          columns={['บริการ', 'ระยะเวลา', 'ราคา', 'สถานะ']}
          rows={services}
        />
        <AdminTable
          id="staff"
          title="จัดการพนักงาน"
          columns={['พนักงาน', 'ความเชี่ยวชาญ', 'ภาระงาน']}
          rows={staff}
        />
      </Box>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        <AdminTable
          id="customers"
          title="จัดการลูกค้า CRM"
          columns={['ลูกค้า', 'กลุ่ม', 'จำนวนใช้บริการ', 'หมายเหตุ']}
          rows={customers}
        />

        <Card id="reports">
          <CardHeader title="รายงานรายได้" subheader="สรุปช่องทางรายได้ประจำเดือน" />
          <CardContent>
            {[
              ['จองออนไลน์', '82,400 บาท', '58%'],
              ['หน้าร้าน', '45,200 บาท', '32%'],
              ['คูปอง / แพ็กเกจ', '14,400 บาท', '10%'],
            ].map((row) => (
              <Box
                key={row[0]}
                sx={{
                  py: 1.5,
                  display: 'grid',
                  gap: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  gridTemplateColumns: '1fr 120px 64px',
                }}
              >
                {row.map((cell) => (
                  <Typography key={cell} variant="body2">
                    {cell}
                  </Typography>
                ))}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </DashboardContent>
  );
}
