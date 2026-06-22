import type { Metadata } from 'next';

import { AdminServicesView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Spa Queue | Sri Kachanan Spa',
  description: 'จัดการคิวทำสปาจาก user ทั้งหมด',
};

export default function Page() {
  return <AdminServicesView mode="queue" />;
}
