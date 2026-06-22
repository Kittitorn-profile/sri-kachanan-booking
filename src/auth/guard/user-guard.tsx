'use client';

import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from './auth-guard';
import { useAuthContext } from '../hooks';
import { getAdminPermissions, getFirstAdminPath, isBackOfficeRole } from '../utils';

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

  if (isBackOfficeRole(user?.role)) {
    router.replace(getFirstAdminPath(getAdminPermissions(user?.role, user?.adminPermissions)));
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
