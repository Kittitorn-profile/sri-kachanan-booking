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

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthedQuery } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

import { AdminTable, AdminStatusPill, AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type DashboardBooking = {
  id: string;
  time: string;
  customerName: string;
  service: string;
  staff: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
};

type DashboardPromotion = {
  id: string;
  title: string;
  code: string;
  discountLabel: string;
};

type AdminDashboardResponse = {
  stats: {
    bookingsToday: number;
    revenueThisMonth: number;
    customers: number;
    activePromotions: number;
    queueAvailable: number | null;
  };
  bookings: DashboardBooking[];
  promotions: DashboardPromotion[];
  customers: string[][];
};

const bookingStatusLabels: Record<DashboardBooking['status'], string> = {
  pending: 'รอยืนยันคิว',
  confirmed: 'ยืนยันคิวแล้ว',
  in_progress: 'เปิดงานแล้ว',
  completed: 'ปิดงานแล้ว',
  cancelled: 'ยกเลิก',
};

function formatMoney(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}K` : value.toLocaleString();
}

export function AdminView() {
  const {
    data,
    error,
    isLoading,
    refetch,
  } = useAuthedQuery<AdminDashboardResponse>({
    queryKey: queryKeys.admin.dashboard,
    url: endpoints.admin.dashboard,
  });
  const stats = data?.stats;
  const adminStats = [
    {
      label: 'ยอดจองวันนี้',
      value: String(stats?.bookingsToday ?? 0),
      icon: 'solar:calendar-date-bold' as const,
      color: '#2f7d54',
    },
    {
      label: 'รายได้เดือนนี้',
      value: formatMoney(stats?.revenueThisMonth ?? 0),
      icon: 'solar:wad-of-money-bold' as const,
      color: '#8a5b26',
    },
    {
      label: 'ลูกค้าทั้งหมด',
      value: String(stats?.customers ?? 0),
      icon: 'solar:users-group-rounded-bold-duotone' as const,
      color: '#3d61a8',
    },
    {
      label: 'คิวว่างวันนี้',
      value: stats?.queueAvailable === null ? 'ไม่จำกัด' : String(stats?.queueAvailable ?? 0),
      icon: 'solar:clock-circle-bold' as const,
      color: '#8c4f9f',
    },
  ];

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="ระบบหลังบ้าน"
        description="ภาพรวมยอดจอง ลูกค้า โปรโมชั่น และทางลัดไปยังหน้าจัดการหลัก"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => refetch()}
              startIcon={<Iconify icon="solar:restart-bold" />}
            >
              รีเฟรช
            </Button>
            <Button href={paths.admin.servicesQueue} variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>
              ดูคิวทั้งหมด
            </Button>
          </Stack>
        }
      />

      {error && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography color="error">{error.message}</Typography>
          </CardContent>
        </Card>
      )}

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
              {(data?.bookings ?? []).map((booking) => {
                const row = [
                  booking.time,
                  booking.customerName,
                  booking.service,
                  `พนักงาน: ${booking.staff}`,
                  bookingStatusLabels[booking.status],
                ];

                return (
                <Box
                  key={booking.id}
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
                );
              })}
              {!data?.bookings.length && !isLoading && (
                <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                  วันนี้ยังไม่มีรายการจอง
                </Typography>
              )}
              {isLoading && (
                <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                  กำลังโหลดข้อมูล dashboard...
                </Typography>
              )}
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
              {(data?.promotions ?? []).map((promotion) => (
                <Box
                  key={promotion.id}
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
                  <Typography variant="body2">
                    {promotion.title}
                    {promotion.discountLabel ? ` (${promotion.discountLabel})` : ''}
                  </Typography>
                </Box>
              ))}
              {!data?.promotions.length && !isLoading && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ยังไม่มีโปรโมชั่นที่เปิดใช้งาน
                </Typography>
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
          title="จัดการลูกค้า CRM"
          columns={['ลูกค้า', 'กลุ่ม', 'จำนวนใช้บริการ', 'หมายเหตุ']}
          rows={data?.customers ?? []}
        />

        <Card>
          <CardHeader title="ทางลัดจัดการ" subheader="แยกหน้าหลักของ admin ให้ชัดเจน" />
          <CardContent>
            <Stack spacing={1}>
              {[
                ['คำขอสมัครสมาชิก', paths.admin.registrationRequests],
                ['คิวทั้งหมด', paths.admin.servicesQueue],
                ['งานบริการ', paths.master.category],
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
