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

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';

import { AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type SpaCategory = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CategoryForm = {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
};

const emptyCategoryForm: CategoryForm = {
  name: '',
  description: '',
  price: '',
  isActive: true,
};

const rowsPerPageOptions = [5, 10, 25];

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPrice(price: number | null) {
  return price === null ? '-' : `${price.toLocaleString()} บาท`;
}

function parseOptionalPrice(value: string) {
  if (!value.trim()) {
    return null;
  }

  return Number(value);
}

export function AdminCategoryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [editingCategory, setEditingCategory] = useState<SpaCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<SpaCategory | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    data,
    error: fetchCategoryError,
    isLoading: loadingCategories,
  } = useAuthedQuery<{ categories: SpaCategory[] }>({
    queryKey: queryKeys.admin.spaCategories,
    url: `${endpoints.admin.spaCategories}?includeInactive=true`,
  });
  const saveCategory = useAuthedMutation<
    { category: SpaCategory },
    { id?: string; name: string; description: string; price: number | null; isActive: boolean }
  >({
    method: editingCategory ? 'patch' : 'post',
    url: endpoints.admin.spaCategories,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.spaCategories });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => setCategoryError(error.message || 'บันทึกงานบริการไม่สำเร็จ'),
  });
  const deleteCategory = useAuthedMutation<{ success: boolean }, SpaCategory>({
    method: 'delete',
    url: (category) => `${endpoints.admin.spaCategories}?id=${category.id}`,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.spaCategories });
      setDeletingCategory(null);
    },
    onError: (error) => {
      setCategoryError(error.message || 'ลบงานบริการไม่สำเร็จ');
      setDeletingCategory(null);
    },
  });
  const categories = data?.categories ?? [];
  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      category.name,
      stripHtml(category.description),
      formatPrice(category.price),
      category.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0);
  }, [categories.length]);

  const handleOpenCreateCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryError(null);
    setCategoryForm(emptyCategoryForm);
    setIsCategoryDialogOpen(true);
  }, []);

  const handleOpenEditCategory = useCallback((category: SpaCategory) => {
    setEditingCategory(category);
    setCategoryError(null);
    setCategoryForm({
      name: category.name,
      description: category.description,
      price: category.price === null ? '' : String(category.price),
      isActive: category.isActive,
    });
    setIsCategoryDialogOpen(true);
  }, []);

  const handleCloseCategoryDialog = useCallback(() => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    setCategoryError(null);
  }, []);

  const handleSaveCategory = useCallback(async () => {
    const name = categoryForm.name.trim();

    if (!name) {
      setCategoryError('กรุณากรอกชื่องานบริการ');
      return;
    }

    const price = parseOptionalPrice(categoryForm.price);

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setCategoryError('กรุณาระบุราคาเป็นตัวเลข 0 ขึ้นไป');
      return;
    }

    saveCategory.mutate({
      id: editingCategory?.id,
      name,
      description: categoryForm.description,
      price,
      isActive: categoryForm.isActive,
    });
  }, [
    categoryForm.description,
    categoryForm.isActive,
    categoryForm.name,
    categoryForm.price,
    editingCategory,
    saveCategory,
  ]);

  const handleDeleteCategory = useCallback(async () => {
    if (!deletingCategory) {
      return;
    }

    deleteCategory.mutate(deletingCategory);
  }, [deleteCategory, deletingCategory]);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="งานบริการ"
        description="จัดการงานบริการ ราคา และรายละเอียดที่ลูกค้าเลือกตอนจอง"
        action={
          <Button
            variant="contained"
            onClick={handleOpenCreateCategory}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            เพิ่มงานบริการ
          </Button>
        }
      />

      <Card>
        <CardContent>
          {(categoryError || fetchCategoryError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {categoryError || fetchCategoryError?.message}
            </Alert>
          )}

          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาชื่องานบริการ รายละเอียด ราคา หรือสถานะ"
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
              gridTemplateColumns: '1fr 1.7fr 130px 120px 170px',
            }}
          >
            {['งานบริการ', 'รายละเอียด', 'ราคา', 'สถานะ', 'จัดการ'].map((column) => (
              <Typography key={column} variant="caption" sx={{ color: 'text.secondary' }}>
                {column}
              </Typography>
            ))}
          </Box>

          <Stack divider={<Divider flexItem />} spacing={0}>
            {paginatedCategories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  py: 1.75,
                  display: 'grid',
                  gap: { xs: 1.25, md: 2 },
                  alignItems: 'start',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1.7fr 130px 120px 170px' },
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>{category.name}</Typography>
                {category.description ? (
                  <Box
                    sx={{
                      color: 'text.secondary',
                      typography: 'body2',
                      '& p': { m: 0 },
                    }}
                    dangerouslySetInnerHTML={{ __html: category.description }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    -
                  </Typography>
                )}
                <Typography variant="body2">{formatPrice(category.price)}</Typography>
                <Chip
                  size="small"
                  variant="soft"
                  color={category.isActive ? 'success' : 'default'}
                  label={category.isActive ? 'active' : 'inactive'}
                />
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenEditCategory(category)}
                    startIcon={<Iconify icon="solar:pen-bold" />}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => setDeletingCategory(category)}
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  >
                    ลบ
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>

          {!!filteredCategories.length && (
            <TablePagination
              component="div"
              page={page}
              count={filteredCategories.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setPage(0);
                setRowsPerPage(parseInt(event.target.value, 10));
              }}
            />
          )}

          {!filteredCategories.length && !loadingCategories && (
            <Box
              sx={{
                py: 5,
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: 'background.neutral',
              }}
            >
              <Typography sx={{ fontWeight: 800 }}>ยังไม่มีงานบริการ</Typography>
            </Box>
          )}

          {loadingCategories && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>กำลังโหลดงานบริการ...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={isCategoryDialogOpen}
        onClose={handleCloseCategoryDialog}
      >
        <DialogTitle>{editingCategory ? 'แก้ไขงานบริการ' : 'เพิ่มงานบริการ'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {categoryError && <Alert severity="error">{categoryError}</Alert>}

            <TextField
              autoFocus
              label="ชื่องานบริการ"
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <TextField
              type="number"
              label="ราคา"
              value={categoryForm.price}
              onChange={(event) =>
                setCategoryForm((current) => ({ ...current, price: event.target.value }))
              }
              helperText="เว้นว่างได้"
              slotProps={{
                htmlInput: { min: 0, step: 0.01 },
                input: {
                  endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                },
              }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{ mb: 0.75, display: 'block', color: 'text.secondary' }}
              >
                รายละเอียด
              </Typography>
              <Editor
                value={categoryForm.description}
                placeholder="รายละเอียดงานบริการ"
                onChange={(value) =>
                  setCategoryForm((current) => ({ ...current, description: value }))
                }
                sx={{ minHeight: 220 }}
              />
            </Box>
            <FormControlLabel
              label="เปิดใช้งาน"
              control={
                <Switch
                  checked={categoryForm.isActive}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
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
          <Button variant="outlined" onClick={handleCloseCategoryDialog}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            disabled={!categoryForm.name.trim()}
            onClick={handleSaveCategory}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deletingCategory} onClose={() => setDeletingCategory(null)}>
        <DialogTitle>ลบงานบริการ</DialogTitle>
        <DialogContent>
          <Typography>ต้องการลบงานบริการ {deletingCategory?.name} หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeletingCategory(null)}>
            ยกเลิก
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteCategory}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
