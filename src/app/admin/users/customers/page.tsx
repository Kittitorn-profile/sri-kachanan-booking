import type { Metadata } from 'next';

import { AdminCustomersView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Customers | Sri Kachanan Spa',
  description: 'ข้อมูลลูกค้าที่เคยทำสปาจบแล้ว',
};

export default function Page() {
  return <AdminCustomersView />;
}
