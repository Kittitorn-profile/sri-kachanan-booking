import type { Metadata } from 'next';

import { AdminStaffView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Spa Staff | Sri Kachanan Spa',
  description: 'จัดการข้อมูลพนักงาน ความเชี่ยวชาญ และภาระงาน',
};

export default function Page() {
  return <AdminStaffView />;
}
