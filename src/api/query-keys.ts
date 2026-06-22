export const queryKeys = {
  booking: ['booking'] as const,
  spaCategories: ['spa-categories'] as const,
  admin: {
    users: (role?: string, status?: string) => ['admin', 'users', role ?? 'all', status ?? 'all'] as const,
    customers: (search?: string) => ['admin', 'customers', search ?? ''] as const,
    spaBookings: (status?: string) => ['admin', 'spa-bookings', status ?? 'all'] as const,
    spaCategories: ['admin', 'spa-categories'] as const,
    spaPromotions: ['admin', 'spa-promotions'] as const,
    bookingAvailability: ['admin', 'booking-availability'] as const,
  },
};
