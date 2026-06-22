import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  rows: string[][];
  columns: string[];
};

export function AdminTable({ title, rows, columns }: Props) {
  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <Button size="small" variant="outlined" startIcon={<Iconify icon="solar:pen-bold" />}>
            จัดการ
          </Button>
        }
      />
      <CardContent>
        <Box
          sx={{
            mb: 1,
            display: { xs: 'none', md: 'grid' },
            gap: 2,
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column) => (
            <Typography key={column} variant="caption" sx={{ color: 'text.secondary' }}>
              {column}
            </Typography>
          ))}
        </Box>
        <Stack divider={<Divider flexItem />} spacing={0}>
          {rows.map((row) => (
            <Box
              key={row.join('-')}
              sx={{
                py: 1.5,
                display: 'grid',
                gap: { xs: 0.75, md: 2 },
                gridTemplateColumns: { xs: '1fr', md: `repeat(${columns.length}, minmax(0, 1fr))` },
              }}
            >
              {row.map((cell, index) => (
                <Typography
                  key={`${cell}-${index}`}
                  variant="body2"
                  sx={{ color: index === 0 ? 'text.primary' : 'text.secondary' }}
                >
                  {cell}
                </Typography>
              ))}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
