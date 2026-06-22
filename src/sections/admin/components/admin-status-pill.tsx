import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AdminStatusPill({ children }: Props) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        width: 'fit-content',
        borderRadius: 999,
        typography: 'caption',
        fontWeight: 700,
        color: 'success.darker',
        bgcolor: 'success.lighter',
      }}
    >
      {children}
    </Box>
  );
}
