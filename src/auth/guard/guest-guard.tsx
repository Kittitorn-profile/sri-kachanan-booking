'use client';

import { useState, useEffect } from 'react';
import { safeReturnUrl } from 'minimal-shared/utils';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { getAdminPermissions, getFirstAdminPath, isBackOfficeRole } from '../utils';

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: React.ReactNode;
};

const getUserRedirectUrl = (returnTo: string | null) => {
  const redirectUrl = safeReturnUrl(returnTo, CONFIG.auth.redirectPath);

  return redirectUrl.startsWith('/admin') ? CONFIG.auth.redirectPath : redirectUrl;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();

  const { user, loading, authenticated } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const searchParams = useSearchParams();
  const redirectUrl =
    isBackOfficeRole(user?.role)
      ? getFirstAdminPath(getAdminPermissions(user?.role, user?.adminPermissions))
      : getUserRedirectUrl(searchParams.get('returnTo'));

  const checkPermissions = async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (authenticated) {
      router.replace(redirectUrl);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, redirectUrl]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
