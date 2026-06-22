'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
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
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthedMutation } from 'src/api/use-authed-query';

import { Iconify } from 'src/components/iconify';

import {
  adminStaff,
  adminMenuPermissions,
  type AdminStaffMember,
  type AdminStaffStatus,
} from 'src/sections/admin/data/admin-data';

import { AdminStatusPill, AdminPageHeading } from '../components';

// ----------------------------------------------------------------------

type StaffForm = Omit<AdminStaffMember, 'id'> & {
  password: string;
};

type CreateStaffBody = {
  email: string;
  password: string;
  displayName: string;
  role: 'employee';
  approvalStatus: 'approved' | 'rejected';
};

const emptyStaffForm: StaffForm = {
  name: '',
  email: '',
  password: '',
  specialty: '',
  workload: '',
  permissions: ['dashboard'],
  status: 'active',
};

const rowsPerPageOptions = [5, 10, 25];

function getPermissionLabel(permissionValue: string) {
  return (
    adminMenuPermissions.find((permission) => permission.value === permissionValue)?.label ??
    permissionValue
  );
}

function StaffStatusChip({ status }: { status: AdminStaffStatus }) {
  const isActive = status === 'active';

  return (
    <Chip
      size="small"
      variant="soft"
      color={isActive ? 'success' : 'default'}
      label={isActive ? 'active' : 'inactive'}
    />
  );
}

export function AdminStaffView() {
  const [staffMembers, setStaffMembers] = useState<AdminStaffMember[]>(adminStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [staffForm, setStaffForm] = useState<StaffForm>(emptyStaffForm);
  const [viewingStaff, setViewingStaff] = useState<AdminStaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<AdminStaffMember | null>(null);
  const [editingStaff, setEditingStaff] = useState<AdminStaffMember | null>(null);
  const [staffFormError, setStaffFormError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const createStaff = useAuthedMutation<
    {
      user: {
        id: string;
        email: string;
        displayName: string;
        approvalStatus: 'approved' | 'rejected';
      };
    },
    CreateStaffBody
  >({
    method: 'post',
    url: endpoints.admin.users,
    onError: (error) => {
      setStaffFormError(error.message || 'สร้างบัญชีพนักงานไม่สำเร็จ');
    },
  });

  const isEditMode = !!editingStaff;
  const filteredStaffMembers = staffMembers.filter((staff) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [staff.name, staff.email, staff.specialty, staff.workload, staff.status]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
  const paginatedStaffMembers = filteredStaffMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleOpenAddDialog = useCallback(() => {
    setEditingStaff(null);
    setStaffFormError(null);
    setStaffForm(emptyStaffForm);
    setIsFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((staff: AdminStaffMember) => {
    setEditingStaff(staff);
    setStaffFormError(null);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      password: '',
      status: staff.status,
      workload: staff.workload,
      specialty: staff.specialty,
      permissions: staff.permissions,
    });
    setIsFormDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setIsFormDialogOpen(false);
    setStaffFormError(null);
    setEditingStaff(null);
  }, []);

  const handleToggleFormPermission = useCallback((permission: string) => {
    setStaffForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }, []);

  const handleSaveStaff = useCallback(async () => {
    const name = staffForm.name.trim();
    const email = staffForm.email.trim().toLowerCase();
    const password = staffForm.password;

    if (!name) {
      return;
    }

    if (!email) {
      setStaffFormError('กรุณากรอกอีเมลพนักงาน');
      return;
    }

    if (!editingStaff && password.length < 6) {
      setStaffFormError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    const nextStaff: AdminStaffMember = {
      id: editingStaff?.id ?? '',
      ...staffForm,
      name,
      email,
      specialty: staffForm.specialty.trim() || '-',
      workload: staffForm.workload.trim() || 'ยังไม่มีคิววันนี้',
    };

    if (editingStaff) {
      setStaffMembers((current) =>
        current.map((staff) => (staff.id === editingStaff.id ? { ...staff, ...nextStaff } : staff))
      );
    } else {
      try {
        setStaffFormError(null);

        const data = await createStaff.mutateAsync({
          email,
          password,
          displayName: name,
          role: 'employee',
          approvalStatus: staffForm.status === 'active' ? 'approved' : 'rejected',
        });

        setStaffMembers((current) => [...current, { ...nextStaff, id: data.user.id }]);
      } catch (error) {
        setStaffFormError(error instanceof Error ? error.message : 'สร้างบัญชีพนักงานไม่สำเร็จ');
        return;
      }
    }

    setIsFormDialogOpen(false);
    setEditingStaff(null);
  }, [createStaff, editingStaff, staffForm]);

  const handleDeleteStaff = useCallback(() => {
    if (!deletingStaff) {
      return;
    }

    setStaffMembers((current) => current.filter((staff) => staff.id !== deletingStaff.id));
    setPage((currentPage) => {
      const nextCount = staffMembers.length - 1;
      const lastPage = Math.max(0, Math.ceil(nextCount / rowsPerPage) - 1);

      return Math.min(currentPage, lastPage);
    });
    setDeletingStaff(null);
  }, [deletingStaff, rowsPerPage, staffMembers.length]);

  return (
    <DashboardContent maxWidth="xl" sx={{ mt: 10 }}>
      <AdminPageHeading
        title="จัดการพนักงาน"
        description="เพิ่ม ดู แก้ไข ลบ และกำหนดสถานะ active / inactive ของพนักงาน"
        action={
          <Button
            variant="contained"
            onClick={handleOpenAddDialog}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            เพิ่มพนักงาน
          </Button>
        }
      />

      <Card>
        <CardHeader title="รายการพนักงาน" subheader="แสดงสถานะและสิทธิ์เมนูที่พนักงานเข้าถึงได้" />
        <CardContent>
          <TextField
            fullWidth
            value={searchQuery}
            placeholder="ค้นหาชื่อ อีเมล ความเชี่ยวชาญ หรือสถานะ"
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
              gridTemplateColumns: '1fr 1fr 1fr 110px 2fr 150px',
            }}
          >
            {['พนักงาน', 'ความเชี่ยวชาญ', 'ภาระงาน', 'สถานะ', 'สิทธิ์เมนู', 'จัดการ'].map(
              (column) => (
                <Typography key={column} variant="caption" sx={{ color: 'text.secondary' }}>
                  {column}
                </Typography>
              )
            )}
          </Box>

          <Stack divider={<Divider flexItem />} spacing={0}>
            {paginatedStaffMembers.map((staff) => (
              <Box
                key={staff.id}
                sx={{
                  py: 2,
                  display: 'grid',
                  gap: { xs: 1.5, md: 2 },
                  alignItems: 'start',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 110px 2fr 150px' },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{staff.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {staff.email}
                  </Typography>
                  <AdminStatusPill>{staff.permissions.length} เมนู</AdminStatusPill>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {staff.specialty}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {staff.workload}
                </Typography>
                <StaffStatusChip status={staff.status} />
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.75,
                    flexWrap: 'wrap',
                  }}
                >
                  {staff.permissions.length ? (
                    staff.permissions.map((permission) => (
                      <Chip
                        key={permission}
                        size="small"
                        variant="soft"
                        label={getPermissionLabel(permission)}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      ไม่มีสิทธิ์เมนู
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setViewingStaff(staff)}
                    startIcon={<Iconify icon="solar:eye-bold" />}
                  >
                    ดู
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenEditDialog(staff)}
                    startIcon={<Iconify icon="solar:pen-bold" />}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => setDeletingStaff(staff)}
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  >
                    ลบ
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>

          <TablePagination
            component="div"
            page={page}
            count={filteredStaffMembers.length}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onPageChange={(_event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setPage(0);
              setRowsPerPage(parseInt(event.target.value, 10));
            }}
          />
        </CardContent>
      </Card>

      <Dialog fullWidth maxWidth="sm" open={isFormDialogOpen} onClose={handleCloseFormDialog}>
        <DialogTitle>{isEditMode ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {staffFormError && <Alert severity="error">{staffFormError}</Alert>}

            <TextField
              autoFocus
              label="ชื่อพนักงาน"
              value={staffForm.name}
              onChange={(event) =>
                setStaffForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <TextField
              label="อีเมลสำหรับเข้าสู่ระบบ"
              value={staffForm.email}
              disabled={isEditMode}
              onChange={(event) =>
                setStaffForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            {!isEditMode && (
              <TextField
                label="รหัสผ่านเริ่มต้น"
                type="password"
                value={staffForm.password}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                onChange={(event) =>
                  setStaffForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            )}
            <TextField
              label="ความเชี่ยวชาญ"
              value={staffForm.specialty}
              onChange={(event) =>
                setStaffForm((current) => ({ ...current, specialty: event.target.value }))
              }
            />
            <TextField
              label="ภาระงาน"
              value={staffForm.workload}
              placeholder="เช่น 3 คิววันนี้"
              onChange={(event) =>
                setStaffForm((current) => ({ ...current, workload: event.target.value }))
              }
            />
            <TextField
              select
              label="สถานะ"
              value={staffForm.status}
              onChange={(event) =>
                setStaffForm((current) => ({
                  ...current,
                  status: event.target.value as AdminStaffStatus,
                }))
              }
            >
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="inactive">inactive</MenuItem>
            </TextField>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                สิทธิ์การเข้าถึงเมนู
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 0.5,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                {adminMenuPermissions.map((permission) => (
                  <FormControlLabel
                    key={permission.value}
                    label={permission.label}
                    control={
                      <Checkbox
                        size="small"
                        checked={staffForm.permissions.includes(permission.value)}
                        onChange={() => handleToggleFormPermission(permission.value)}
                      />
                    }
                    sx={{
                      m: 0,
                      '& .MuiFormControlLabel-label': { typography: 'body2' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseFormDialog}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            disabled={!staffForm.name.trim() || !staffForm.email.trim()}
            onClick={handleSaveStaff}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" open={!!viewingStaff} onClose={() => setViewingStaff(null)}>
        <DialogTitle>รายละเอียดพนักงาน</DialogTitle>
        <DialogContent>
          {viewingStaff && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ชื่อพนักงาน
                </Typography>
                <Typography sx={{ fontWeight: 800 }}>{viewingStaff.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  อีเมล
                </Typography>
                <Typography>{viewingStaff.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ความเชี่ยวชาญ
                </Typography>
                <Typography>{viewingStaff.specialty}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ภาระงาน
                </Typography>
                <Typography>{viewingStaff.workload}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  สถานะ
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StaffStatusChip status={viewingStaff.status} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  สิทธิ์เมนู
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                  {viewingStaff.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      size="small"
                      variant="soft"
                      label={getPermissionLabel(permission)}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setViewingStaff(null)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deletingStaff} onClose={() => setDeletingStaff(null)}>
        <DialogTitle>ลบพนักงาน</DialogTitle>
        <DialogContent>
          <Typography>
            ต้องการลบ {deletingStaff?.name} ออกจากรายการพนักงานหรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeletingStaff(null)}>
            ยกเลิก
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteStaff}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
