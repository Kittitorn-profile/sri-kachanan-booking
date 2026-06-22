export type SpaService = {
  id: string;
  name: string;
  categoryId: string | null;
  duration: string;
  durationMinutes: number;
  price: number;
};

export type SpaCategory = {
  id: string;
  name: string;
  description: string;
  price: number | null;
};

export type AvailabilityDay = {
  id: string;
  date: string;
  label: string;
  fullLabel: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number | null;
  maxBookingsPerDay: number | null;
  bookedCount: number;
  remainingBookings: number | null;
  note: string;
  slots: string[];
};

export type BookingStatus = 'confirmed' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type StatusFilter = 'all' | BookingStatus;

export type BookingItem = {
  id: string;
  bookingNo: string;
  serviceId: string;
  categoryId: string | null;
  service: string;
  duration: string;
  price: number;
  date: string;
  dateLabel: string;
  time: string;
  staffId?: string;
  staff?: string;
  customerName: string;
  phone: string;
  customerNote: string;
  imageUrls: string[];
  jobItems: string;
  jobImageUrls: string[];
  jobOpenedAt?: string;
  status: BookingStatus;
  note: string;
};

export type BookingForm = {
  serviceId: string;
  categoryId: string;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  customerNote: string;
  imageUrls: string[];
};

export type OpenJobForm = {
  jobItems: string;
  jobImageUrls: string[];
};

export type BookingApiResponse = {
  profile: {
    displayName?: string;
    phone?: string;
  };
  services: SpaService[];
  availability: AvailabilityDay[];
  bookings: Omit<BookingItem, 'dateLabel' | 'note'>[];
};

export type BookingMutationResponse = {
  booking: Omit<BookingItem, 'dateLabel' | 'note'>;
};
