import type { Metadata } from 'next';

import { AdminRevenueView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Revenue Report | Sri Kachanan Spa',
  description: 'รายงานรายได้และสัดส่วนช่องทางการขาย',
};

export default function Page() {
  return <AdminRevenueView />;
}
