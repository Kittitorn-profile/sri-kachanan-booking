'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

import { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/api/query-keys';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthedQuery, useAuthedMutation } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

import { AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type SpaPromotion = {
  id: string;
  title: string;
  code: string;
  description: string;
  discountLabel: string;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PromotionForm = {
  title: string;
  code: string;
  description: string;
  discountLabel: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const emptyPromotionForm: PromotionForm = {
  title: '',
  code: '',
  description: '',
  discountLabel: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

const rowsPerPageOptions = [5, 10, 25];

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return '-';
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

export function AdminPromotionsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [promotionForm, setPromotionForm] = useState<PromotionForm>(emptyPromotionForm);
  const [editingPromotion, setEditingPromotion] = useState<SpaPromotion | null>(null);
  const [deletingPromotion, setDeletingPromotion] = useState<SpaPromotion | null>(null);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    data,
    error: fetchPromotionError,
    isLoading: loadingPromotions,
  } = useAuthedQuery<{ promotions: SpaPromotion[] }>({
    queryKey: queryKeys.admin.spaPromotions,
    url: endpoints.admin.spaPromotions,
  });
  const savePromotion = useAuthedMutation<
    { promotion: SpaPromotion },
    {
      id?: string;
      title: string;
      code: string;
      description: string;
      discountLabel: string;
      startsAt: string | null;
      endsAt: string | null;
      isActive: boolean;
    }
  >({
    method: editingPromotion ? 'patch' : 'post',
    url: endpoints.admin.spaPromotions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.spaPromotions });
      setIsPromotionDialogOpen(false);
      setEditingPromotion(null);
    },
    onError: (error) => setPromotionError(error.message || 'บันทึกโปรโมชั่นไม่สำเร็จ'),
  });
  const deletePromotion = useAuthedMutation<{ success: boolean }, SpaPromotion>({
    method: 'delete',
    url: (promotion) => `${endpoints.admin.spaPromotions}?id=${promotion.id}`,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.spaPromotions });
      setDeletingPromotion(null);
    },
    onError: (error) => {
      setPromotionError(error.message || 'ลบโปรโมชั่นไม่สำเร็จ');
      setDeletingPromotion(null);
    },
  });
  const promotions = data?.promotions ?? [];
  const filteredPromotions = promotions.filter((promotion) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      promotion.title,
      promotion.code,
      promotion.description,
      promotion.discountLabel,
      promotion.startsAt,
      promotion.endsAt,
      promotion.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
  const paginatedPromotions = filteredPromotions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [promotions.length]);

  const handleOpenCreatePromotion = useCallback(() => {
    setEditingPromotion(null);
    setPromotionError(null);
    setPromotionForm(emptyPromotionForm);
    setIsPromotionDialogOpen(true);
  }, []);

  const handleOpenEditPromotion = useCallback((promotion: SpaPromotion) => {
    setEditingPromotion(promotion);
    setPromotionError(null);
    setPromotionForm({
      title: promotion.title,
      code: promotion.code,
      description: promotion.description,
      discountLabel: promotion.discountLabel,
      startsAt: promotion.startsAt ?? '',
      endsAt: promotion.endsAt ?? '',
      isActive: promotion.isActive,
    });
    setIsPromotionDialogOpen(true);
  }, []);

  const handleClosePromotionDialog = useCallback(() => {
    setIsPromotionDialogOpen(false);
    setEditingPromotion(null);
    setPromotionError(null);
  }, []);

  const handleSavePromotion = useCallback(async () => {
    const title = promotionForm.title.trim();
    const code = promotionForm.code.trim();

    if (!title || !code) {
      setPromotionError('กรุณากรอกชื่อโปรโมชั่นและโค้ด');
      return;
    }

    savePromotion.mutate({
      id: editingPromotion?.id,
      title,
      code,
      description: promotionForm.description,
      discountLabel: promotionForm.discountLabel,
      startsAt: promotionForm.startsAt || null,
      endsAt: promotionForm.endsAt || null,
      isActive: promotionForm.isActive,
    });
  }, [editingPromotion, promotionForm, savePromotion]);

  const handleDeletePromotion = useCallback(async () => {
    if (!deletingPromotion) {
      return;
    }

    deletePromotion.mutate(deletingPromotion);
  }, [deletePromotion, deletingPromotion]);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="โปรโมชั่น / คูปอง"
        description="จัดการแคมเปญ ส่วนลด และคูปองที่ใช้กับการจองสปา"
        action={
          <Button
            variant="contained"
            onClick={handleOpenCreatePromotion}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            เพิ่มโปรโมชั่น
          </Button>
        }
      />

      <Card>
        <CardHeader title="รายการโปรโมชั่น" subheader="เปิด/ปิด แก้ไข และกำหนดช่วงเวลาใช้งาน" />
        <CardContent>
          {(promotionError || fetchPromotionError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {promotionError || fetchPromotionError?.message}
            </Alert>
          )}

          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาโปรโมชั่น โค้ด รายละเอียด หรือสถานะ"
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(0);
            }}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:list-bold" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              mb: 1,
              display: { xs: 'none', md: 'grid' },
              gap: 2,
              gridTemplateColumns: '1.2fr 120px 1.3fr 180px 120px 170px',
            }}
          >
            {['โปรโมชั่น', 'โค้ด', 'รายละเอียด', 'ช่วงเวลา', 'สถานะ', 'จัดการ'].map((column) => (
              <Typography key={column} variant="caption" sx={{ color: 'text.secondary' }}>
                {column}
              </Typography>
            ))}
          </Box>

          <Stack divider={<Divider flexItem />} spacing={0}>
            {paginatedPromotions.map((promotion) => (
              <Box
                key={promotion.id}
                sx={{
                  py: 1.75,
                  display: 'grid',
                  gap: { xs: 1.25, md: 2 },
                  alignItems: 'start',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1.2fr 120px 1.3fr 180px 120px 170px',
                  },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{promotion.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {promotion.discountLabel || '-'}
                  </Typography>
                </Box>
                <Chip size="small" variant="soft" color="info" label={promotion.code} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {promotion.description || '-'}
                </Typography>
                <Typography variant="body2">
                  {formatDate(promotion.startsAt)} - {formatDate(promotion.endsAt)}
                </Typography>
                <Chip
                  size="small"
                  variant="soft"
                  color={promotion.isActive ? 'success' : 'default'}
                  label={promotion.isActive ? 'active' : 'inactive'}
                />
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenEditPromotion(promotion)}
                    startIcon={<Iconify icon="solar:pen-bold" />}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => setDeletingPromotion(promotion)}
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  >
                    ลบ
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>

          {!!filteredPromotions.length && (
            <TablePagination
              component="div"
              page={page}
              count={filteredPromotions.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setPage(0);
                setRowsPerPage(parseInt(event.target.value, 10));
              }}
            />
          )}

          {!filteredPromotions.length && !loadingPromotions && (
            <Box
              sx={{
                py: 5,
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: 'background.neutral',
              }}
            >
              <Typography sx={{ fontWeight: 800 }}>ยังไม่มีโปรโมชั่น</Typography>
            </Box>
          )}

          {loadingPromotions && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>กำลังโหลดโปรโมชั่น...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={isPromotionDialogOpen}
        onClose={handleClosePromotionDialog}
      >
        <DialogTitle>{editingPromotion ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่น'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {promotionError && <Alert severity="error">{promotionError}</Alert>}

            <TextField
              autoFocus
              label="ชื่อโปรโมชั่น"
              value={promotionForm.title}
              onChange={(event) =>
                setPromotionForm((current) => ({ ...current, title: event.target.value }))
              }
            />
            <TextField
              label="โค้ดคูปอง"
              value={promotionForm.code}
              onChange={(event) =>
                setPromotionForm((current) => ({ ...current, code: event.target.value }))
              }
            />
            <TextField
              label="ป้ายส่วนลด"
              value={promotionForm.discountLabel}
              onChange={(event) =>
                setPromotionForm((current) => ({ ...current, discountLabel: event.target.value }))
              }
            />
            <TextField
              multiline
              minRows={3}
              label="รายละเอียด"
              value={promotionForm.description}
              onChange={(event) =>
                setPromotionForm((current) => ({ ...current, description: event.target.value }))
              }
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="วันที่เริ่ม"
                value={promotionForm.startsAt}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) =>
                  setPromotionForm((current) => ({ ...current, startsAt: event.target.value }))
                }
              />
              <TextField
                fullWidth
                type="date"
                label="วันที่สิ้นสุด"
                value={promotionForm.endsAt}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) =>
                  setPromotionForm((current) => ({ ...current, endsAt: event.target.value }))
                }
              />
            </Stack>
            <FormControlLabel
              label="เปิดใช้งาน"
              control={
                <Switch
                  checked={promotionForm.isActive}
                  onChange={(event) =>
                    setPromotionForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClosePromotionDialog}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            disabled={!promotionForm.title.trim() || !promotionForm.code.trim()}
            onClick={handleSavePromotion}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deletingPromotion} onClose={() => setDeletingPromotion(null)}>
        <DialogTitle>ลบโปรโมชั่น</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบโปรโมชั่น {deletingPromotion?.title} หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeletingPromotion(null)}>
            ยกเลิก
          </Button>
          <Button color="error" variant="contained" onClick={handleDeletePromotion}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
