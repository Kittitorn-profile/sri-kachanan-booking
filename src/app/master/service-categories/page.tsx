import type { Metadata } from 'next';

import { AdminCategoryView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Service Categories | Sri Kachanan Spa',
  description: 'จัดการข้อมูลหลักหมวดหมู่บริการสปา',
};

export default function Page() {
  return <AdminCategoryView />;
}
