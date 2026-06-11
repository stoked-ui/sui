import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import type { CalendarBookingProps, BookingFormData, TimeSlot } from './CalendarBooking.types';

interface DayState {
  date: string;
  dayName: string;
  dayNum: number;
  slots: TimeSlot[];
  loading: boolean;
  unavailable: boolean;
}

interface SelectedSlot {
  date: string;
  iso: string;
  label: string;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const dow = date.getDay(); // 0=Sun
  const diff = date.getDate() - dow + (dow === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

// ── MiniCalendar ────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  year: number;
  month: number;
  selectedDate: string | null;
  onDateClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function MiniCalendar({
  year, month, selectedDate, onDateClick, onPrevMonth, onNextMonth,
}: MiniCalendarProps) {
  const theme = useTheme();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0

  type Cell = { dateStr: string; dayNum: number; current: boolean };
  const cells: Cell[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ dateStr: toDateStr(d), dayNum: d.getDate(), current: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    cells.push({ dateStr: toDateStr(date), dayNum: d, current: true });
  }
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    cells.push({ dateStr: toDateStr(date), dayNum: d, current: false });
  }

  const btnBase = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    fontSize: 18,
    lineHeight: 1,
    p: '2px 8px',
    borderRadius: '4px',
    '&:hover': { backgroundColor: theme.palette.action.hover },
  } as const;

  return (
    <Box data-testid="mini-calendar" sx={{ width: 220, userSelect: 'none', flexShrink: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box component="button" onClick={onPrevMonth} sx={btnBase}>‹</Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {MONTH_NAMES[month]} {year}
        </Typography>
        <Box component="button" onClick={onNextMonth} sx={btnBase}>›</Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <Typography key={i} variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 600, fontSize: 10 }}>
            {d}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((cell) => {
          const isSelected = selectedDate === cell.dateStr;
          return (
            <Box
              key={cell.dateStr}
              onClick={() => onDateClick(cell.dateStr)}
              sx={{
                textAlign: 'center',
                cursor: 'pointer',
                py: '3px',
                borderRadius: '50%',
                fontSize: 11,
                color: cell.current
                  ? isSelected ? 'primary.contrastText' : 'text.primary'
                  : 'text.disabled',
                backgroundColor: isSelected ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected
                    ? 'primary.dark'
                    : theme.palette.action.hover,
                },
              }}
            >
              {cell.dayNum}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function CalendarBooking({
  apiBaseUrl = '',
  onSuccess,
  onError,
}: CalendarBookingProps) {
  const theme = useTheme();

  const todayRef = useRef<Date | null>(null);
  if (!todayRef.current) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    todayRef.current = d;
  }
  const today = todayRef.current;

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(today));
  const [days, setDays] = useState<DayState[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [duration, setDuration] = useState(30);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '', email: '', phone: '', company: '', reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const dragStartY = useRef<number | null>(null);
  const dragStartDuration = useRef(30);

  function buildWeekDays(weekStartDate: Date): DayState[] {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStartDate, i);
      const isPast = date < today;
      return {
        date: toDateStr(date),
        dayName: WEEK_DAYS[i],
        dayNum: date.getDate(),
        slots: [],
        loading: !isPast,
        unavailable: isPast,
      };
    });
  }

  async function fetchWeekAvailability(weekDays: DayState[]): Promise<DayState[]> {
    return Promise.all(
      weekDays.map(async (day) => {
        if (day.unavailable) return day;
        try {
          const res = await fetch(`${apiBaseUrl}/api/calendar/availability?date=${day.date}`);
          if (!res.ok) return { ...day, loading: false, unavailable: true, slots: [] };
          const data = await res.json();
          const slots: TimeSlot[] = (data.slots || []).map((iso: string) => {
            const d = new Date(iso);
            return {
              iso,
              label: d.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true,
              }),
              hour: d.getHours(),
              minute: d.getMinutes(),
            };
          });
          return { ...day, loading: false, slots, unavailable: slots.length === 0 };
        } catch {
          return { ...day, loading: false, unavailable: true, slots: [] };
        }
      }),
    );
  }

  useEffect(() => {
    const weekDays = buildWeekDays(weekStart);
    setDays(weekDays);
    setSelectedSlot(null);
    fetchWeekAvailability(weekDays).then(setDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, apiBaseUrl]);

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const [y, m, d] = dateStr.split('-').map(Number);
    setWeekStart(getMonday(new Date(y, m - 1, d)));
  };

  const handleSlotClick = (slot: TimeSlot, date: string) => {
    setSelectedSlot({ date, iso: slot.iso, label: slot.label });
    setDuration(30);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    dragStartDuration.current = duration;

    const onMouseMove = (ev: MouseEvent) => {
      if (dragStartY.current === null) return;
      const deltaY = ev.clientY - dragStartY.current;
      const deltaMin = Math.round((deltaY * 0.5) / 15) * 15;
      setDuration(Math.max(30, Math.min(120, dragStartDuration.current + deltaMin)));
    };

    const onMouseUp = () => {
      dragStartY.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isSubmitEnabled = !!(formData.name && formData.email && formData.phone && selectedSlot);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/calendar/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          reason: formData.reason,
          startTime: selectedSlot.iso,
          durationMinutes: duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book appointment');

      setSubmitSuccess(true);
      setSelectedSlot(null);
      setFormData({ name: '', email: '', phone: '', company: '', reason: '' });
      setDuration(30);
      onSuccess?.(data.eventId, data.eventLink);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to book appointment';
      setSubmitError(msg);
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto' }}>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: mini calendar */}
        <MiniCalendar
          year={calYear}
          month={calMonth}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

        {/* Right: week grid */}
        <Box
          data-testid="week-grid"
          sx={{ flex: 1, minWidth: 0, overflowX: 'auto' }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(72px, 1fr))', gap: 0.5 }}>
            {days.map((day) => (
              <Box key={day.date} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                  data-testid="day-column-header"
                  sx={{
                    textAlign: 'center',
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10 }}>
                    {day.dayName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>
                    {day.dayNum}
                  </Typography>
                </Box>

                {day.loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                    <CircularProgress size={14} />
                  </Box>
                ) : day.unavailable ? (
                  <Box
                    data-testid="day-unavailable"
                    sx={{ textAlign: 'center', color: 'text.disabled', fontSize: 12, pt: 0.5 }}
                  >
                    —
                  </Box>
                ) : (
                  <Box>
                    {day.slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.iso === slot.iso && selectedSlot?.date === day.date;
                      return (
                        <Box
                          key={slot.iso}
                          data-testid="time-slot"
                          data-selected={isSelected ? 'true' : 'false'}
                          onClick={() => handleSlotClick(slot, day.date)}
                          sx={{
                            textAlign: 'center',
                            py: '3px',
                            px: '2px',
                            mb: '2px',
                            borderRadius: 1,
                            fontSize: 10,
                            cursor: 'pointer',
                            fontWeight: isSelected ? 700 : 400,
                            backgroundColor: isSelected
                              ? 'primary.main'
                              : theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.07)'
                              : 'rgba(0,0,0,0.05)',
                            color: isSelected ? 'primary.contrastText' : 'text.primary',
                            '&:hover': {
                              backgroundColor: isSelected
                                ? 'primary.dark'
                                : theme.palette.action.hover,
                            },
                          }}
                        >
                          {slot.label}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Success banner */}
      {submitSuccess && (
        <Box
          data-testid="booking-success"
          sx={{
            mt: 3, p: 2, borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light',
            color: 'success.contrastText',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Appointment booked! Check your email for confirmation.
          </Typography>
        </Box>
      )}

      {/* Booking form */}
      {selectedSlot && !submitSuccess && (
        <Box
          component="form"
          data-testid="booking-form"
          onSubmit={handleSubmit}
          sx={{
            mt: 3, p: 3, borderRadius: 2,
            border: '1px solid', borderColor: 'divider',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {selectedSlot.label} — {selectedSlot.date}
          </Typography>

          {/* Duration block with drag handle */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 1.5, borderRadius: '4px 4px 0 0',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedSlot.label}
              </Typography>
              <Typography
                data-testid="duration-display"
                variant="caption"
                display="block"
              >
                {duration} min
              </Typography>
            </Box>
            <Box
              data-testid="duration-drag-handle-bottom"
              onMouseDown={handleDragMouseDown}
              sx={{
                height: 10,
                cursor: 'ns-resize',
                backgroundColor: 'primary.dark',
                borderRadius: '0 0 4px 4px',
                '&:hover': { opacity: 0.8 },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth label="Name *" name="name"
                value={formData.name} onChange={handleFormChange}
                size="small" required disabled={submitting}
              />
              <TextField
                fullWidth label="Email *" name="email" type="email"
                value={formData.email} onChange={handleFormChange}
                size="small" required disabled={submitting}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth label="Phone *" name="phone"
                value={formData.phone} onChange={handleFormChange}
                size="small" required disabled={submitting}
              />
              <TextField
                fullWidth label="Company" name="company"
                value={formData.company} onChange={handleFormChange}
                size="small" disabled={submitting}
              />
            </Box>
            <TextField
              fullWidth label="Reason" name="reason"
              value={formData.reason} onChange={handleFormChange}
              size="small" disabled={submitting}
            />

            {submitError && (
              <Box
                data-testid="booking-error"
                sx={{
                  p: 1.5, borderRadius: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light',
                  color: 'error.contrastText',
                }}
              >
                <Typography variant="body2">{submitError}</Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!isSubmitEnabled || submitting}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Book Appointment'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
