'use client';

import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from './auth-guard';
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type UserGuardProps = {
  children: React.ReactNode;
};

function UserPermissionGuard({ children }: UserGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  if (loading) {
    return <SplashScreen />;
  }

  if (user?.role === 'admin') {
    router.replace('/admin');
    return <SplashScreen />;
  }

  if (user?.role !== 'user') {
    router.replace('/');
    return <SplashScreen />;
  }

  return <>{children}</>;
}

export function UserGuard({ children }: UserGuardProps) {
  return (
    <AuthGuard>
      <UserPermissionGuard>{children}</UserPermissionGuard>
    </AuthGuard>
  );
}
