export interface CalendarBookingProps {
  apiBaseUrl: string;
  onSuccess?: (eventId: string, eventLink: string) => void;
  onError?: (error: string) => void;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  reason?: string;
  startTime?: string;
  durationMinutes: number;
}

export interface AvailabilitySlot {
  time: string;
  label: string;
}

export interface BookingResponse {
  eventId?: string;
  eventLink?: string;
  error?: string;
}
