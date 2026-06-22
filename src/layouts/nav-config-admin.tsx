import type { NavSectionProps } from 'src/components/nav-section';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const adminNavData: NavSectionProps['data'] = [
  {
    subheader: 'จัดการ',
    items: [
      {
        title: 'Dashboard',
        path: '/admin',
        icon: <Iconify icon="solar:home-angle-bold-duotone" />,
      },
      {
        title: 'บริการสปา',
        path: '/admin#services',
        icon: <Iconify icon="solar:tea-cup-bold" />,
      },
      {
        title: 'พนักงาน',
        path: '/admin#staff',
        icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />,
      },
      {
        title: 'ลูกค้า CRM',
        path: '/admin#customers',
        icon: <Iconify icon="solar:user-rounded-bold" />,
      },
      {
        title: 'โปรโมชั่น / คูปอง',
        path: '/admin#promotions',
        icon: <Iconify icon="solar:tag-horizontal-bold-duotone" />,
      },
      {
        title: 'รายงานรายได้',
        path: '/admin#reports',
        icon: <Iconify icon="solar:chart-square-outline" />,
      },
    ],
  },
  {
    subheader: 'หน้าร้าน',
    items: [
      {
        title: 'กลับหน้าเว็บไซต์',
        path: '/',
        icon: <Iconify icon="solar:reply-bold" />,
      },
    ],
  },
];
