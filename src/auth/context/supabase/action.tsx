'use client';

import type {
  AuthError,
  UserResponse,
  AuthTokenResponsePassword,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

import { paths } from 'src/routes/paths';

import { supabase } from 'src/lib/supabase';
import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
  options?: SignInWithPasswordCredentials['options'];
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  options?: SignUpWithPasswordCredentials['options'];
};

export type ResetPasswordParams = {
  email: string;
  options?: {
    redirectTo?: string;
    captchaToken?: string;
  };
};

export type UpdatePasswordParams = {
  password: string;
  options?: {
    emailRedirectTo?: string | undefined;
  };
};

type UserProfileAuth = {
  role: 'admin' | 'user';
  approval_status: 'pending' | 'approved' | 'rejected';
};

type SignInResponse = AuthTokenResponsePassword & {
  data: AuthTokenResponsePassword['data'] & {
    profile: UserProfileAuth;
  };
};

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

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({
  email,
  password,
}: SignInParams): Promise<SignInResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error(error);
    throw error;
  }

  const syncedProfile = await syncProfile(data.session.access_token);

  if (!syncedProfile) {
    await supabase.auth.signOut();
    throw new Error('ไม่พบข้อมูลสิทธิ์ผู้ใช้');
  }

  const approvalStatus = syncedProfile.approval_status;
  const appRole = syncedProfile.role;
  const isAdminAccount = appRole === 'admin';

  if (!isAdminAccount && approvalStatus !== 'approved') {
    await supabase.auth.signOut();

    throw new Error(
      approvalStatus === 'rejected'
        ? 'บัญชีนี้ถูกปฏิเสธโดยผู้ดูแลระบบ'
        : 'บัญชีของคุณกำลังรอผู้ดูแลระบบอนุมัติ'
    );
  }

  return { data: { ...data, profile: syncedProfile }, error };
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<{ data: unknown; error: null }> => {
  const { data } = await axios.post(endpoints.auth.signUp, {
    email,
    password,
    firstName,
    lastName,
  });

  return { data, error: null };
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<{
  error: AuthError | null;
}> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    throw error;
  }

  return { error };
};

/** **************************************
 * Reset password
 *************************************** */
export const resetPassword = async ({
  email,
}: ResetPasswordParams): Promise<{ data: {}; error: null } | { data: null; error: AuthError }> => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${paths.auth.supabase.updatePassword}`,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return { data, error };
};

/** **************************************
 * Update password
 *************************************** */
export const updatePassword = async ({ password }: UpdatePasswordParams): Promise<UserResponse> => {
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error(error);
    throw error;
  }

  return { data, error };
};
