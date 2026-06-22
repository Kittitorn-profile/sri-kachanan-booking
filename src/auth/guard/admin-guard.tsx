'use client';

import { useRouter, usePathname } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { AuthGuard } from './auth-guard';
import { useAuthContext } from '../hooks';
import {
  getFirstAdminPath,
  isBackOfficeRole,
  getAdminPermissions,
  getAdminPermissionForPath,
  canAccessAdminPermission,
} from '../utils';

// ----------------------------------------------------------------------

type AdminGuardProps = {
  children: React.ReactNode;
};

function AdminPermissionGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthContext();

  if (loading) {
    return <SplashScreen />;
  }

  if (!isBackOfficeRole(user?.role)) {
    router.replace('/');
    return <SplashScreen />;
  }

  const currentPermission = getAdminPermissionForPath(pathname);

  if (!canAccessAdminPermission(user?.role, user?.adminPermissions, currentPermission)) {
    router.replace(getFirstAdminPath(getAdminPermissions(user?.role, user?.adminPermissions)));
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
