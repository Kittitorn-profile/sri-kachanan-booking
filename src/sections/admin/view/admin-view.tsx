'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import {
  adminStats,
  adminBookings,
  adminCustomers,
  adminPromotions,
} from 'src/sections/admin/data/admin-data';

import { AdminTable, AdminStatusPill, AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

export function AdminView() {
  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="ระบบหลังบ้าน"
        description="ภาพรวมยอดจอง ลูกค้า โปรโมชั่น และทางลัดไปยังหน้าจัดการหลัก"
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Iconify icon="solar:download-bold" />}>
              ส่งออกรายงาน
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>
              เพิ่มการจอง
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        {adminStats.map((stat) => (
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
            action={<AdminStatusPill>ป้องกันจองเวลาซ้ำ</AdminStatusPill>}
          />
          <CardContent>
            <Stack divider={<Divider flexItem />}>
              {adminBookings.map((row) => (
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
                      <AdminStatusPill key={cell}>{cell}</AdminStatusPill>
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

        <Card>
          <CardHeader
            title="โปรโมชั่น / คูปอง"
            subheader="แคมเปญที่กำลังใช้งาน"
            action={
              <Button
                href={paths.admin.promotions}
                size="small"
                variant="outlined"
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              >
                จัดการ
              </Button>
            }
          />
          <CardContent>
            <Stack spacing={1.5}>
              {adminPromotions.map((promotion) => (
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
              ))}
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
          title="จัดการลูกค้า CRM"
          columns={['ลูกค้า', 'กลุ่ม', 'จำนวนใช้บริการ', 'หมายเหตุ']}
          rows={adminCustomers}
        />

        <Card>
          <CardHeader title="ทางลัดจัดการ" subheader="แยกหน้าหลักของ admin ให้ชัดเจน" />
          <CardContent>
            <Stack spacing={1}>
              {[
                ['คำขอสมัครสมาชิก', paths.admin.registrationRequests],
                ['คิวทั้งหมด', paths.admin.servicesQueue],
                ['หมวดหมู่บริการ', paths.master.category],
                ['โปรโมชั่น / คูปอง', paths.admin.promotions],
                ['พนักงาน', paths.admin.staff],
                ['รายงานรายได้', paths.admin.revenue],
              ].map(([label, href]) => (
                <Button
                  key={label}
                  href={href}
                  variant="outlined"
                  sx={{ justifyContent: 'space-between' }}
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                >
                  {label}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardContent>
  );
}
