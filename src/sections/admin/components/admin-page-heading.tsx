import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function AdminPageHeading({ title, description, action }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4">{title}</Typography>
        <Typography sx={{ mt: 0.75, color: 'text.secondary' }}>{description}</Typography>
      </Box>

      {action}
    </Stack>
  );
}
