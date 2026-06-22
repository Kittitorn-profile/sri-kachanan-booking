import type { Metadata } from 'next';

import { AdminRegistrationRequestsView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Registration Requests | Sri Kachanan Spa',
  description: 'อนุมัติหรือปฏิเสธคำขอสมัครสมาชิก',
};

export default function Page() {
  return <AdminRegistrationRequestsView />;
}
