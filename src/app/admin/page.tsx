import type { Metadata } from 'next';

import { AdminView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Admin | Sri Kachanan Spa',
  description: 'ระบบหลังบ้านสำหรับจัดการจอง บริการ พนักงาน ลูกค้า โปรโมชั่น และรายงานรายได้',
};

export default function Page() {
  return <AdminView />;
}
