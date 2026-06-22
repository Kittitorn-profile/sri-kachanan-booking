import type { Metadata } from 'next';

import { AdminPromotionsView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Promotions | Sri Kachanan Spa',
  description: 'จัดการโปรโมชั่นและคูปองสำหรับการจองสปา',
};

export default function Page() {
  return <AdminPromotionsView />;
}
