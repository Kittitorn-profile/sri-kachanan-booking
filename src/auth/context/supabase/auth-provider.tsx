'use client';

import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { supabase } from 'src/lib/supabase';
import axios, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

type UserProfileAuth = {
  display_name: string;
  role: 'admin' | 'employee' | 'user';
  approval_status: 'pending' | 'approved' | 'rejected';
  admin_permissions: string[];
};

function getSessionProfile(user: NonNullable<AuthState['user']>['user']): UserProfileAuth {
  const metadata = user.user_metadata ?? {};
  const isWebRegistered = metadata.account_source === 'web' || Boolean(metadata.requested_at);
  const metadataRole = metadata.role as UserProfileAuth['role'] | undefined;
  const role =
    metadataRole && ['admin', 'employee', 'user'].includes(metadataRole)
      ? metadataRole
      : isWebRegistered
        ? 'user'
        : 'admin';

  return {
    display_name:
      (metadata.display_name as string | undefined) ||
      user.email ||
      (role === 'admin' ? 'Super Admin' : ''),
    role,
    approval_status:
      role === 'admin'
        ? 'approved'
        : role === 'employee'
          ? ((metadata.approval_status as UserProfileAuth['approval_status'] | undefined) ??
            'approved')
          : ((metadata.approval_status as UserProfileAuth['approval_status'] | undefined) ??
            'pending'),
    admin_permissions: Array.isArray(metadata.admin_permissions)
      ? metadata.admin_permissions.filter(
          (permission: unknown): permission is string => typeof permission === 'string'
        )
      : [],
  };
}

async function syncProfile(accessToken: string): Promise<UserProfileAuth> {
  const { data } = await axios.post<{ profile: UserProfileAuth }>(
    endpoints.auth.syncProfile,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return data.profile;
}

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setState({ user: null, loading: false });
        console.error(error);
        throw error;
      }

      if (session) {
        const accessToken = session?.access_token;
        const sessionUser = {
          ...session,
          ...session?.user,
          profile: getSessionProfile(session.user),
        };

        setState({
          user: sessionUser,
          loading: false,
        });
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        const syncedProfile = await syncProfile(accessToken);

        setState({
          user: {
            ...sessionUser,
            profile: syncedProfile,
          },
          loading: false,
        });
      } else {
        setState({ user: null, loading: false });
        delete axios.defaults.headers.common.Authorization;
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            id: state.user?.id,
            accessToken: state.user?.access_token,
            displayName: state.user?.profile?.display_name ?? state.user?.email,
            role: state.user?.profile?.role ?? 'user',
            approvalStatus: state.user?.profile?.approval_status,
            adminPermissions: state.user?.profile?.admin_permissions ?? [],
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
