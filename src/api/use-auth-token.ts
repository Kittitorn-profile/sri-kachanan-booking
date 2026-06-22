'use client';

import { useCallback } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

export function useAuthToken() {
  return useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token;
  }, []);
}
