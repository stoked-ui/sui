import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import type { CalendarBookingProps, BookingFormData } from './CalendarBooking.types';

// ── Constants ────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 36; // px per 30-min slot

// 10:30 AM to 5:30 PM, 30-min intervals = 15 rows
const TIME_SLOTS = [
  { hour: 10, minute: 30 }, { hour: 11, minute: 0 }, { hour: 11, minute: 30 },
  { hour: 12, minute: 0 }, { hour: 12, minute: 30 }, { hour: 13, minute: 0 },
  { hour: 13, minute: 30 }, { hour: 14, minute: 0 }, { hour: 14, minute: 30 },
  { hour: 15, minute: 0 }, { hour: 15, minute: 30 }, { hour: 16, minute: 0 },
  { hour: 16, minute: 30 }, { hour: 17, minute: 0 }, { hour: 17, minute: 30 },
] as const;

const GRID_HEIGHT = ROW_HEIGHT * TIME_SLOTS.length;

// Slot instants from the API are pinned to the business timezone; map them to
// grid rows in that zone so visitors in any timezone see the same grid.
const BUSINESS_TIMEZONE = 'America/Chicago';

const businessZoneFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIMEZONE,
  hour12: false,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit',
});

// Grid row index for a server slot instant, or -1 if it falls outside the
// given calendar day / known time slots (in the business timezone)
function slotRowForIso(iso: string, dateStr: string): number {
  const parts: Record<string, string> = {};
  for (const p of businessZoneFormatter.formatToParts(new Date(iso))) {
    if (p.type !== 'literal') {parts[p.type] = p.value;}
  }
  if (`${parts.year}-${parts.month}-${parts.day}` !== dateStr) {return -1;}
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  return TIME_SLOTS.findIndex(s => s.hour === hour && s.minute === minute);
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const dow = date.getDay();
  date.setDate(date.getDate() - dow + (dow === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function formatTimeLabel(hour: number, minute: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${suffix}`;
}

// ── MiniCalendar ─────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  year: number;
  month: number;
  selectedDate: string | null;
  onDateClick: (d: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function MiniCalendar({ year, month, selectedDate, onDateClick, onPrevMonth, onNextMonth }: MiniCalendarProps) {
  const theme = useTheme();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;

  const cells: { dateStr: string; dayNum: number; current: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ dateStr: toDateStr(d), dayNum: d.getDate(), current: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ dateStr: toDateStr(new Date(year, month, d)), dayNum: d, current: true });
  }
  const rem = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= rem; d++) {
    cells.push({ dateStr: toDateStr(new Date(year, month + 1, d)), dayNum: d, current: false });
  }

  const btnSx = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: theme.palette.text.primary, fontSize: 16, lineHeight: 1,
    padding: '2px 6px', borderRadius: '4px',
    '&:hover': { backgroundColor: theme.palette.action.hover },
  } as const;

  return (
    <Box data-testid="mini-calendar" sx={{ marginTop: 20, width: 220, flexShrink: 0, userSelect: 'none' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box component="button" onClick={onPrevMonth} sx={btnSx}>‹</Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {MONTH_NAMES[month]} {year}
        </Typography>
        <Box component="button" onClick={onNextMonth} sx={btnSx}>›</Box>
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
          const sel = selectedDate === cell.dateStr;
          return (
            <Box
              key={cell.dateStr}
              onClick={() => onDateClick(cell.dateStr)}
              sx={{
                textAlign: 'center', cursor: 'pointer', py: '3px', borderRadius: '50%', fontSize: 11,
                color: cell.current ? (sel ? 'primary.contrastText' : 'text.primary') : 'text.disabled',
                backgroundColor: sel ? 'primary.main' : 'transparent',
                '&:hover': { backgroundColor: sel ? 'primary.dark' : theme.palette.action.hover },
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

// ── Main Component ────────────────────────────────────────────────────────────

interface DayState {
  date: string;
  dayName: string;
  dayNum: number;
  slotIsoByRow: Map<number, string>; // grid row index → server slot instant (ISO)
  loading: boolean;
}

export default function CalendarBooking({ apiBaseUrl = '', onSuccess, onError }: CalendarBookingProps) {
  const theme = useTheme();

  const todayRef = useRef<Date | null>(null);
  if (!todayRef.current) {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    todayRef.current = d;
  }
  const today = todayRef.current;

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(today));
  const [days, setDays] = useState<DayState[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(-1);
  const [duration, setDuration] = useState(30);
  const [formData, setFormData] = useState<BookingFormData>({ name: '', email: '', phone: '', company: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const dragStartY = useRef<number | null>(null);
  const dragStartDuration = useRef(30);

  function buildWeekDays(ws: Date): DayState[] {
    return Array.from({ length: 5 }, (_, i) => {
      const date = addDays(ws, i);
      return { date: toDateStr(date), dayName: WEEK_DAYS[i], dayNum: date.getDate(), slotIsoByRow: new Map(), loading: date >= today };
    });
  }

  async function fetchDay(day: DayState): Promise<DayState> {
    if (!day.loading) {return day;} // past — skip
    try {
      const res = await fetch(`${apiBaseUrl}/api/calendar/availability?date=${day.date}`);
      if (!res.ok) {return { ...day, loading: false };}
      const data = await res.json();
      const slotIsoByRow = new Map<number, string>();
      for (const iso of (data.slots || []) as string[]) {
        const row = slotRowForIso(iso, day.date);
        if (row >= 0) {slotIsoByRow.set(row, iso);}
      }
      return { ...day, loading: false, slotIsoByRow };
    } catch {
      return { ...day, loading: false };
    }
  }

  useEffect(() => {
    const initial = buildWeekDays(weekStart);
    setDays(initial);
    setSelectedDay(null);
    setSelectedTimeIndex(-1);
    setDuration(30);
    Promise.all(initial.map(fetchDay)).then(setDays);
     
  }, [weekStart, apiBaseUrl]);

  function isAvailable(day: DayState, idx: number): boolean {
    const iso = day.slotIsoByRow.get(idx);
    return !!iso && new Date(iso).getTime() > Date.now();
  }

  function isPastDay(day: DayState): boolean {
    const [y, m, d] = day.date.split('-').map(Number);
    return new Date(y, m - 1, d) < today;
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const [y, m, d] = dateStr.split('-').map(Number);
    setWeekStart(getMonday(new Date(y, m - 1, d)));
  };

  const handleSlotClick = (dayDate: string, timeIndex: number) => {
    setSelectedDay(dayDate);
    setSelectedTimeIndex(timeIndex);
    setDuration(30);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    dragStartDuration.current = duration;
    const onMove = (ev: MouseEvent) => {
      if (dragStartY.current === null) {return;}
      const delta = ev.clientY - dragStartY.current;
      const snap = Math.round((delta * 0.5) / 15) * 15;
      setDuration(Math.max(30, Math.min(120, dragStartDuration.current + snap)));
    };
    const onUp = () => {
      dragStartY.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isSubmitEnabled = !!(formData.name && formData.email && formData.phone && selectedDay && selectedTimeIndex >= 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || selectedTimeIndex < 0) {return;}
    const startTime = days.find(d => d.date === selectedDay)?.slotIsoByRow.get(selectedTimeIndex);
    if (!startTime) {return;}
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/calendar/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startTime,
          durationMinutes: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) {throw new Error(data.error || 'Failed to book appointment');}
      setSubmitSuccess(true);
      setSelectedDay(null);
      setSelectedTimeIndex(-1);
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

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else {setCalMonth(m => m - 1);} };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else {setCalMonth(m => m + 1);} };

  const durationRows = duration / 30; // may be fractional (45 min = 1.5)
  const blockHeight = Math.max(ROW_HEIGHT, durationRows * ROW_HEIGHT);

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: mini calendar */}
        <MiniCalendar
          year={calYear} month={calMonth}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onPrevMonth={prevMonth} onNextMonth={nextMonth}
        />

        {/* Right: week grid */}
        <Box data-testid="week-grid" sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {/* Day headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', mb: 0.5 }}>
            <Box /> {/* time label spacer */}
            {days.map(day => (
              <Box
                key={day.date}
                data-testid="day-column-header"
                sx={{ textAlign: 'center', py: 0.75 }}
              >
                <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10 }}>
                  {day.dayName}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>
                  {day.dayNum}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Time grid body */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)' }}>
            {/* Left time label column */}
            <Box sx={{ position: 'relative', height: GRID_HEIGHT }}>
              {TIME_SLOTS.map((slot, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute', top: i * ROW_HEIGHT, height: ROW_HEIGHT,
                    width: '100%', display: 'flex', alignItems: 'center', pr: '8px',
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled', lineHeight: 1, whiteSpace: 'nowrap' }}>
                    {formatTimeLabel(slot.hour, slot.minute)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Day columns */}
            {days.map(day => {
              const past = isPastDay(day);
              const isSelected = selectedDay === day.date;
              const isToday = day.date === toDateStr(today);
              const dark = theme.palette.mode === 'dark';
              return (
                <Box key={day.date} data-day-column={day.date} sx={{ position: 'relative', height: GRID_HEIGHT }}>
                  {/* Background rows */}
                  {TIME_SLOTS.map((_, i) => {
                    const avail = !past && isAvailable(day, i);
                    const rowSelected = isSelected && i === selectedTimeIndex;
                    return (
                      <Box
                        key={i}
                        data-testid={avail ? 'time-slot' : 'day-unavailable'}
                        data-selected={rowSelected ? 'true' : 'false'}
                        data-today={isToday ? 'true' : 'false'}
                        onClick={avail ? () => handleSlotClick(day.date, i) : undefined}
                        sx={{
                          position: 'absolute', top: i * ROW_HEIGHT + 2, height: ROW_HEIGHT - 5,
                          left: 3, right: 3,
                          borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: avail ? 'pointer' : 'default',
                          backgroundColor: avail
                            ? (dark
                              ? (isToday ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.07)')
                              : (isToday ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.06)'))
                            : (dark
                              ? (isToday ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)')
                              : (isToday ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.025)')),
                          '&:hover': avail ? { backgroundColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.13)' } : {},
                        }}
                      >
                        {!avail && (
                          <Typography component="span" sx={{ fontSize: 11, lineHeight: 1, color: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)', userSelect: 'none' }}>
                            —
                          </Typography>
                        )}
                      </Box>
                    );
                  })}

                  {/* Loading overlay */}
                  {day.loading && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={14} />
                    </Box>
                  )}

                  {/* Selected event block */}
                  {isSelected && selectedTimeIndex >= 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: selectedTimeIndex * ROW_HEIGHT,
                        height: blockHeight,
                        left: 2, right: 2,
                        backgroundColor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        zIndex: 2,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                      }}
                    >
                      <Typography variant="caption" sx={{ display: 'block', color: 'primary.contrastText', px: 0.5, pt: '2px', fontSize: 10, lineHeight: 1.2 }}>
                        {formatTimeLabel(TIME_SLOTS[selectedTimeIndex].hour, TIME_SLOTS[selectedTimeIndex].minute)}
                      </Typography>
                      <Typography
                        data-testid="duration-display"
                        variant="caption"
                        sx={{ display: 'block', color: 'primary.contrastText', px: 0.5, fontSize: 9, lineHeight: 1 }}
                      >
                        {duration} min
                      </Typography>
                    </Box>
                  )}

                  {/* Drag handle — sits below the block, pointer-events enabled */}
                  {isSelected && selectedTimeIndex >= 0 && (
                    <Box
                      data-testid="duration-drag-handle-bottom"
                      onMouseDown={handleDragMouseDown}
                      sx={{
                        position: 'absolute',
                        top: selectedTimeIndex * ROW_HEIGHT + blockHeight,
                        left: 2, right: 2,
                        height: 8,
                        backgroundColor: 'primary.dark',
                        borderRadius: '0 0 4px 4px',
                        cursor: 'ns-resize',
                        zIndex: 3,
                        '&:hover': { opacity: 0.8 },
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Success */}
      {submitSuccess && (
        <Box data-testid="booking-success" sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light', color: 'success.contrastText' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Appointment booked! Check your email for confirmation.</Typography>
        </Box>
      )}

      {/* Booking form */}
      {selectedDay && selectedTimeIndex >= 0 && !submitSuccess && (
        <Box
          component="form"
          data-testid="booking-form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {formatTimeLabel(TIME_SLOTS[selectedTimeIndex].hour, TIME_SLOTS[selectedTimeIndex].minute)} — {selectedDay}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleFormChange} size="small" required disabled={submitting} />
              <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} size="small" required disabled={submitting} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleFormChange} size="small" required disabled={submitting} />
              <TextField fullWidth label="Company" name="company" value={formData.company} onChange={handleFormChange} size="small" disabled={submitting} />
            </Box>
            <TextField fullWidth label="Reason" name="reason" value={formData.reason} onChange={handleFormChange} size="small" disabled={submitting} />
            {submitError && (
              <Box data-testid="booking-error" sx={{ p: 1.5, borderRadius: 1, backgroundColor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light', color: 'error.contrastText' }}>
                <Typography variant="body2">{submitError}</Typography>
              </Box>
            )}
            <Button type="submit" variant="contained" size="large" disabled={!isSubmitEnabled || submitting}>
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Book Appointment'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
