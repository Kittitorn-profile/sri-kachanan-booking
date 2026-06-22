import { DashboardLayout } from 'src/layouts/dashboard';
import { adminNavData } from 'src/layouts/nav-config-admin';

import { AdminGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AdminGuard>
      <DashboardLayout slotProps={{ nav: { data: adminNavData } }}>{children}</DashboardLayout>
    </AdminGuard>
  );
}
