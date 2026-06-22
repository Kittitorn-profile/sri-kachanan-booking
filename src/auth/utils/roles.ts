export const backOfficeRoles = ['admin', 'employee'] as const;

export const adminPermissionValues = [
  'dashboard',
  'registrationRequests',
  'customers',
  'services',
  'staff',
  'availability',
  'promotions',
  'categories',
  'revenue',
] as const;

export function isBackOfficeRole(role?: string | null) {
  return backOfficeRoles.includes(role as (typeof backOfficeRoles)[number]);
}

export function getAdminPermissions(role?: string | null, permissions?: string[] | null) {
  if (role === 'admin') {
    return [...adminPermissionValues];
  }

  return permissions?.filter((permission) =>
    adminPermissionValues.includes(permission as (typeof adminPermissionValues)[number])
  ) ?? [];
}

export function canAccessAdminPermission(
  role?: string | null,
  permissions?: string[] | null,
  permission?: string
) {
  if (!permission) {
    return isBackOfficeRole(role);
  }

  return getAdminPermissions(role, permissions).includes(
    permission as (typeof adminPermissionValues)[number]
  );
}

export function getAdminPermissionForPath(pathname: string) {
  if (pathname.startsWith('/admin/users/registration-requests')) {
    return 'registrationRequests';
  }

  if (pathname.startsWith('/admin/users/customers')) {
    return 'customers';
  }

  if (pathname.startsWith('/admin/users')) {
    return 'registrationRequests';
  }

  if (pathname.startsWith('/admin/spa/services')) {
    return 'services';
  }

  if (pathname.startsWith('/admin/spa/staff')) {
    return 'staff';
  }

  if (pathname.startsWith('/admin/spa/availability')) {
    return 'availability';
  }

  if (pathname.startsWith('/admin/spa/promotions')) {
    return 'promotions';
  }

  if (pathname.startsWith('/master/service-categories')) {
    return 'categories';
  }

  if (pathname.startsWith('/admin/reports')) {
    return 'revenue';
  }

  return 'dashboard';
}

export function getFirstAdminPath(permissions: string[] = []) {
  if (permissions.includes('dashboard')) {
    return '/admin';
  }

  if (permissions.includes('registrationRequests')) {
    return '/admin/users/registration-requests';
  }

  if (permissions.includes('customers')) {
    return '/admin/users/customers';
  }

  if (permissions.includes('services')) {
    return '/admin/spa/services/queue';
  }

  if (permissions.includes('staff')) {
    return '/admin/spa/staff';
  }

  if (permissions.includes('availability')) {
    return '/admin/spa/availability';
  }

  if (permissions.includes('promotions')) {
    return '/admin/spa/promotions';
  }

  if (permissions.includes('categories')) {
    return '/master/service-categories';
  }

  if (permissions.includes('revenue')) {
    return '/admin/reports/revenue';
  }

  return '/error/403';
}
