import type { Metadata } from 'next';

import { AdminCategoryView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Service Jobs | Sri Kachanan Spa',
  description: 'จัดการข้อมูลหลักงานบริการสปา',
};

export default function Page() {
  return <AdminCategoryView />;
}
