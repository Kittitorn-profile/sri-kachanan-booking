import { MainLayout } from 'src/layouts/main';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <MainLayout slotProps={{ footer: { sx: { bgcolor: '#efe3d4' } } }}>{children}</MainLayout>
    </AuthGuard>
  );
}
