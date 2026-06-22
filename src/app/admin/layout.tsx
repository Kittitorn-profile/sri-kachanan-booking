import { DashboardLayout } from 'src/layouts/dashboard';
import { adminNavData } from 'src/layouts/nav-config-admin';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <DashboardLayout slotProps={{ nav: { data: adminNavData } }}>{children}</DashboardLayout>;
}
