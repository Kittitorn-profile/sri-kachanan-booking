import type { Metadata } from 'next';

import { BookingView } from 'src/sections/booking/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Booking | Sri Kachanan Spa',
  description: 'จองคิวและจัดการนัดหมายของสมาชิก Sri Kachanan Spa',
};

export default function Page() {
  return <BookingView />;
}
