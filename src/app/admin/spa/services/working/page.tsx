import type { Metadata } from 'next';

import { AdminServicesView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Working Spa Queue | Sri Kachanan Spa',
  description: 'รายการคิวที่คอนเฟิร์มแล้วและอยู่ระหว่างทำงาน',
};

export default function Page() {
  return <AdminServicesView mode="working" />;
}
