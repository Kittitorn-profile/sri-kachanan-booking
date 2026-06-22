import { MainLayout } from 'src/layouts/main';

import { UserGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <UserGuard>
      <MainLayout slotProps={{ footer: { sx: { bgcolor: '#efe3d4' } } }}>{children}</MainLayout>
    </UserGuard>
  );
}
