'use client';

import Box from '@mui/material/Box';

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { useAuthedQuery } from 'src/api/use-authed-query';

// ----------------------------------------------------------------------

type AdminUsersResponse = {
  users: unknown[];
};

export function RegistrationRequestsBadge() {
  const { data } = useAuthedQuery<AdminUsersResponse>({
    queryKey: queryKeys.admin.users('user', 'pending'),
    url: `${endpoints.admin.users}?role=user&status=pending`,
    refetchInterval: 30 * 1000,
  });

  const count = data?.users.length ?? 0;

  if (!count) {
    return null;
  }

  return (
    <Box
      component="span"
      sx={{
        px: 0.75,
        minWidth: 20,
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'center',
        bgcolor: 'error.main',
        color: 'error.contrastText',
        typography: 'caption',
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {count > 99 ? '99+' : count}
    </Box>
  );
}
