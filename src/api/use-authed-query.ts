'use client';

import type { AxiosRequestConfig } from 'axios';
import type { QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

import { useQuery, useMutation } from '@tanstack/react-query';

import axios from 'src/lib/axios';

import { useAuthToken } from './use-auth-token';

// ----------------------------------------------------------------------

function withAuthHeader(config: AxiosRequestConfig | undefined, accessToken: string) {
  return {
    ...config,
    headers: {
      ...config?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

export function useAuthedQuery<TData>({
  queryKey,
  url,
  config,
  enabled = true,
  ...options
}: {
  queryKey: QueryKey;
  url: string;
  config?: AxiosRequestConfig;
} & Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'>) {
  const getAccessToken = useAuthToken();

  return useQuery<TData, Error, TData, QueryKey>({
    queryKey,
    enabled,
    queryFn: async () => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('ไม่พบ session ของผู้ใช้');
      }

      const { data } = await axios.get<TData>(url, withAuthHeader(config, accessToken));

      return data;
    },
    ...options,
  });
}

export function useAuthedMutation<TData, TVariables = void>({
  method,
  url,
  config,
  ...options
}: {
  method: 'post' | 'patch' | 'delete';
  url: string | ((variables: TVariables) => string);
  config?: AxiosRequestConfig;
} & Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>) {
  const getAccessToken = useAuthToken();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('ไม่พบ session ของผู้ใช้');
      }

      const endpoint = typeof url === 'function' ? url(variables) : url;
      const authedConfig = withAuthHeader(config, accessToken);

      if (method === 'delete') {
        const { data } = await axios.delete<TData>(endpoint, authedConfig);

        return data;
      }

      const { data } = await axios[method]<TData>(endpoint, variables, authedConfig);

      return data;
    },
    ...options,
  });
}
