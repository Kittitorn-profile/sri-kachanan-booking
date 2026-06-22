import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import { RegistrationRequestsBadge } from './components/registration-requests-badge';

// ----------------------------------------------------------------------

export const adminNavData: NavSectionProps['data'] = [
  {
    subheader: 'ภาพรวม',
    items: [
      {
        title: 'แดชบอร์ด',
        path: paths.admin.root,
        allowedRoles: ['admin', 'employee'],
        icon: <Iconify icon="solar:home-angle-bold-duotone" />,
      },
    ],
  },
  {
    subheader: 'ผู้ใช้งาน',
    items: [
      {
        title: 'จัดการผู้ใช้งาน',
        path: paths.admin.users,
        allowedRoles: ['admin'],
        icon: <Iconify icon="solar:user-rounded-bold" />,
        children: [
          {
            title: 'คำขอสมัครสมาชิก',
            path: paths.admin.registrationRequests,
            info: <RegistrationRequestsBadge />,
          },
          {
            title: 'ลูกค้า',
            path: paths.admin.customers,
          },
        ],
      },
    ],
  },
  {
    subheader: 'งานสปา',
    items: [
      {
        title: 'บริการสปา',
        path: paths.admin.services,
        allowedRoles: ['admin', 'employee'],
        icon: <Iconify icon="solar:tea-cup-bold" />,
        children: [
          {
            title: 'คิวทั้งหมด',
            path: paths.admin.servicesQueue,
          },
          {
            title: 'กำลังให้บริการ',
            path: paths.admin.servicesWorking,
          },
        ],
      },
      {
        title: 'พนักงาน',
        path: paths.admin.staff,
        allowedRoles: ['admin'],
        icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />,
      },
      {
        title: 'วันเวลาเปิดรับคิว',
        path: paths.admin.availability,
        allowedRoles: ['admin'],
        icon: <Iconify icon="solar:calendar-date-bold" />,
      },
      {
        title: 'โปรโมชั่น / คูปอง',
        path: paths.admin.promotions,
        allowedRoles: ['admin'],
        icon: <Iconify icon="solar:tag-horizontal-bold-duotone" />,
      },
    ],
  },
  {
    subheader: 'ข้อมูลหลัก',
    items: [
      {
        title: 'หมวดหมู่บริการ',
        path: paths.master.category,
        allowedRoles: ['admin'],
        icon: <Iconify icon="solar:file-bold-duotone" />,
      },
    ],
  },
  {
    subheader: 'รายงาน',
    items: [
      {
        title: 'รายงานรายได้',
        path: paths.admin.revenue,
        allowedRoles: ['admin'],
        icon: <Iconify icon="solar:chart-square-outline" />,
      },
    ],
  },
];
