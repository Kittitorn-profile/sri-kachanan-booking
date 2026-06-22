'use client';

import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from './auth-guard';
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type AdminGuardProps = {
  children: React.ReactNode;
};

function AdminPermissionGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  if (loading) {
    return <SplashScreen />;
  }

  if (user?.role !== 'admin') {
    router.replace('/');
    return <SplashScreen />;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: AdminGuardProps) {
  return (
    <AuthGuard>
      <AdminPermissionGuard>{children}</AdminPermissionGuard>
    </AuthGuard>
  );
}
