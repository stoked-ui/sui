export interface CalendarBookingProps {
  apiBaseUrl?: string;
  onSuccess?: (eventId: string, eventLink: string) => void;
  onError?: (error: string) => void;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  reason: string;
}

export interface TimeSlot {
  iso: string;
  label: string;
  hour: number;
  minute: number;
}

export interface DayColumn {
  date: string;
  label: string;
  dayName: string;
  dayNum: number;
  slots: TimeSlot[];
  loading: boolean;
}
