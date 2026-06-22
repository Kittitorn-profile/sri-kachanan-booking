import type { Metadata } from 'next';

import { AdminAvailabilityView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Spa Booking Availability | Sri Kachanan Spa',
  description: 'จัดการวันเวลาเปิดรับคิวและจำนวนคิวต่อวัน',
};

export default function Page() {
  return <AdminAvailabilityView />;
}
