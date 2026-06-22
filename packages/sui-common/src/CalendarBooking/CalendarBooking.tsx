import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import useMediaQuery from '@mui/material/useMediaQuery';
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

// Wall-clock minutes-of-day of the last bookable slot start (5:30 PM)
const LAST_SLOT_MINUTES =
  TIME_SLOTS[TIME_SLOTS.length - 1].hour * 60 + TIME_SLOTS[TIME_SLOTS.length - 1].minute;

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Availability cache (sessionStorage, 30-min TTL) ───────────────────────────
// Persists across client-side navigation and tab reloads so returning to the
// page within the TTL does not re-query availability.

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_PREFIX = 'sui-availability:';

function readSlotCache(date: string): string[] | null {
  if (typeof window === 'undefined') {return null;}
  try {
    const raw = window.sessionStorage.getItem(CACHE_PREFIX + date);
    if (!raw) {return null;}
    const { slots, ts } = JSON.parse(raw) as { slots: string[]; ts: number };
    if (Date.now() - ts > CACHE_TTL_MS) {return null;}
    return Array.isArray(slots) ? slots : null;
  } catch {
    return null;
  }
}

function writeSlotCache(date: string, slots: string[]): void {
  if (typeof window === 'undefined') {return;}
  try {
    window.sessionStorage.setItem(CACHE_PREFIX + date, JSON.stringify({ slots, ts: Date.now() }));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

// ── Date helpers (string-based, tz-stable) ────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Day-of-week (0=Sun … 6=Sat) for a YYYY-MM-DD string, independent of timezone
function dowOfDateStr(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function isWeekendStr(s: string): boolean {
  const dow = dowOfDateStr(s);
  return dow === 0 || dow === 6;
}

function addDaysStr(s: string, n: number): string {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return toDateStr(dt);
}

// Next business-day date string at or after `s`
function nextBusinessDateStr(s: string): string {
  let cur = s;
  while (isWeekendStr(cur)) {cur = addDaysStr(cur, 1);}
  return cur;
}

// Today's calendar date (YYYY-MM-DD) in the business timezone
function businessTodayStr(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

// Current minutes-of-day in the business timezone
function businessNowMinutes(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE, hour12: false, hour: '2-digit', minute: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  return (get('hour') % 24) * 60 + get('minute');
}

// The first date that still has bookable slots: today if it is a weekday and
// the last slot of the day has not yet started, otherwise the next weekday.
function firstAvailableDateStr(now: Date = new Date()): string {
  const today = businessTodayStr(now);
  if (!isWeekendStr(today) && businessNowMinutes(now) < LAST_SLOT_MINUTES) {
    return today;
  }
  return nextBusinessDateStr(addDaysStr(today, 1));
}

// 5 consecutive business-day date strings starting at `startStr` (weekends skipped)
function buildWindowDates(startStr: string): string[] {
  let cur = nextBusinessDateStr(startStr);
  const out: string[] = [];
  while (out.length < 5) {
    out.push(cur);
    cur = nextBusinessDateStr(addDaysStr(cur, 1));
  }
  return out;
}

function formatTimeLabel(hour: number, minute: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function formatTimeFromMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return formatTimeLabel(h, m);
}

// "Tuesday, June 16" for a YYYY-MM-DD string
function formatLongDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(dt);
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
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
  // Sunday-start weeks
  const startDow = firstDay.getDay();

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

  const dark = theme.palette.mode === 'dark';
  const weekendBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)';

  const btnSx = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: theme.palette.text.primary, fontSize: 16, lineHeight: 1,
    padding: '2px 6px', borderRadius: '4px',
    '&:hover': { backgroundColor: theme.palette.action.hover },
  } as const;

  return (
    <Box
      data-testid="mini-calendar"
      sx={{ marginTop: { xs: 0, sm: '20px' }, width: 240, maxWidth: '100%', flexShrink: 0, userSelect: 'none', mx: { xs: 'auto', sm: 0 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box component="button" aria-label="Previous month" onClick={onPrevMonth} sx={btnSx}>‹</Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {MONTH_NAMES[month]} {year}
        </Typography>
        <Box component="button" aria-label="Next month" onClick={onNextMonth} sx={btnSx}>›</Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Typography
            key={i}
            variant="caption"
            sx={{
              textAlign: 'center', fontWeight: 600, fontSize: 10,
              color: (i === 0 || i === 6) ? 'text.primary' : 'text.secondary',
              backgroundColor: (i === 0 || i === 6) ? weekendBg : 'transparent',
              borderRadius: '4px 4px 0 0',
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((cell, idx) => {
          const sel = selectedDate === cell.dateStr;
          const col = idx % 7;
          const weekend = col === 0 || col === 6;
          return (
            <Box
              key={cell.dateStr}
              data-testid="mini-cal-cell"
              data-weekend={weekend ? 'true' : 'false'}
              data-selected={sel ? 'true' : 'false'}
              onClick={() => onDateClick(cell.dateStr)}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', height: 28, fontSize: 11,
                backgroundColor: weekend ? weekendBg : 'transparent',
              }}
            >
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: '50%',
                  color: cell.current ? (sel ? 'primary.contrastText' : 'text.primary') : 'text.disabled',
                  backgroundColor: sel ? 'primary.main' : 'transparent',
                  '&:hover': { backgroundColor: sel ? 'primary.dark' : theme.palette.action.hover },
                }}
              >
                {cell.dayNum}
              </Box>
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
  const fullScreenModal = useMediaQuery(theme.breakpoints.down('sm'));

  const initialRef = useRef<{ today: string; windowStart: string } | null>(null);
  if (!initialRef.current) {
    const today = businessTodayStr();
    initialRef.current = { today, windowStart: firstAvailableDateStr() };
  }
  const todayStr = initialRef.current.today;

  const [calYear, setCalYear] = useState(() => Number(todayStr.slice(0, 4)));
  const [calMonth, setCalMonth] = useState(() => Number(todayStr.slice(5, 7)) - 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [windowStart, setWindowStart] = useState<string>(initialRef.current.windowStart);
  const [days, setDays] = useState<DayState[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(-1);
  const [duration, setDuration] = useState(30);
  const [formData, setFormData] = useState<BookingFormData>({ name: '', email: '', phone: '', company: '', reason: '' });
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const dragStartY = useRef<number | null>(null);
  const dragStartDuration = useRef(30);

  function buildWeekDays(startStr: string): DayState[] {
    return buildWindowDates(startStr).map((dateStr) => ({
      date: dateStr,
      dayName: WEEKDAY_SHORT[dowOfDateStr(dateStr)],
      dayNum: Number(dateStr.slice(8, 10)),
      slotIsoByRow: new Map(),
      loading: dateStr >= todayStr,
    }));
  }

  async function fetchDay(day: DayState): Promise<DayState> {
    if (!day.loading) {return day;} // past — skip

    const cached = readSlotCache(day.date);
    if (cached) {
      const slotIsoByRow = new Map<number, string>();
      for (const iso of cached) {
        const row = slotRowForIso(iso, day.date);
        if (row >= 0) {slotIsoByRow.set(row, iso);}
      }
      return { ...day, loading: false, slotIsoByRow };
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/calendar/availability?date=${day.date}`);
      if (!res.ok) {return { ...day, loading: false };}
      const data = await res.json();
      const slots = (data.slots || []) as string[];
      writeSlotCache(day.date, slots);
      const slotIsoByRow = new Map<number, string>();
      for (const iso of slots) {
        const row = slotRowForIso(iso, day.date);
        if (row >= 0) {slotIsoByRow.set(row, iso);}
      }
      return { ...day, loading: false, slotIsoByRow };
    } catch {
      return { ...day, loading: false };
    }
  }

  useEffect(() => {
    const initial = buildWeekDays(windowStart);
    setDays(initial);
    setSelectedDay(null);
    setSelectedTimeIndex(-1);
    setDuration(30);
    Promise.all(initial.map(fetchDay)).then(setDays);

  }, [windowStart, apiBaseUrl]);

  function isAvailable(day: DayState, idx: number): boolean {
    const iso = day.slotIsoByRow.get(idx);
    return !!iso && new Date(iso).getTime() > Date.now();
  }

  function isPastDay(day: DayState): boolean {
    return day.date < todayStr;
  }

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setWindowStart(dateStr);
  };

  const handleSlotClick = (dayDate: string, timeIndex: number) => {
    setSelectedDay(dayDate);
    setSelectedTimeIndex(timeIndex);
    setDuration(30);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const closeModal = () => {
    setSelectedDay(null);
    setSelectedTimeIndex(-1);
    setSubmitError('');
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

  const commitInvite = () => {
    const candidate = inviteInput.trim().replace(/[,;]$/, '').trim();
    if (candidate && isValidEmail(candidate) && !inviteEmails.includes(candidate)) {
      setInviteEmails(prev => [...prev, candidate]);
      setInviteInput('');
    }
  };

  const handleInviteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      commitInvite();
    } else if (e.key === 'Backspace' && !inviteInput && inviteEmails.length) {
      setInviteEmails(prev => prev.slice(0, -1));
    }
  };

  const isSubmitEnabled = !!(
    formData.name && formData.email && formData.phone && formData.reason &&
    selectedDay && selectedTimeIndex >= 0
  );

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
          inviteEmails,
        }),
      });
      const data = await res.json();
      if (!res.ok) {throw new Error(data.error || 'Failed to book appointment');}
      setSubmitSuccess(true);
      setSelectedDay(null);
      setSelectedTimeIndex(-1);
      setFormData({ name: '', email: '', phone: '', company: '', reason: '' });
      setInviteEmails([]);
      setInviteInput('');
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

  const modalOpen = !!selectedDay && selectedTimeIndex >= 0 && !submitSuccess;
  const startMinutes = selectedTimeIndex >= 0
    ? TIME_SLOTS[selectedTimeIndex].hour * 60 + TIME_SLOTS[selectedTimeIndex].minute
    : 0;

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 3, md: 7 },
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        {/* Left: mini calendar */}
        <MiniCalendar
          year={calYear} month={calMonth}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onPrevMonth={prevMonth} onNextMonth={nextMonth}
        />

        {/* Right: week grid (horizontally scrollable on small screens) */}
        <Box sx={{ flex: 1, minWidth: 0, width: '100%', overflowX: 'auto' }}>
          <Box data-testid="week-grid" sx={{ minWidth: 320 }}>
            {/* Day headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '48px repeat(5, minmax(44px, 1fr))', mb: 0.5 }}>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: '48px repeat(5, minmax(44px, 1fr))' }}>
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
                const isToday = day.date === todayStr;
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
      </Box>

      {/* Success */}
      {submitSuccess && (
        <Box data-testid="booking-success" sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light', color: 'success.contrastText' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Appointment booked! Check your email for confirmation.</Typography>
        </Box>
      )}

      {/* Booking form modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        fullScreen={fullScreenModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: fullScreenModal ? 0 : 3 } }}
      >
        {modalOpen && (
          <Box
            component="form"
            data-testid="booking-form"
            onSubmit={handleSubmit}
            sx={{ p: { xs: 2.5, sm: 4 } }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 22 }, lineHeight: 1.2 }}>
                  {formatLongDate(selectedDay!)} · {formatTimeFromMinutes(startMinutes)} – {formatTimeFromMinutes(startMinutes + duration)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                  {duration} Minutes · Google Meet
                </Typography>
              </Box>
              <Link
                component="button"
                type="button"
                onClick={closeModal}
                data-testid="change-time"
                underline="hover"
                sx={{ fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, mt: 0.5 }}
              >
                Change time
              </Link>
            </Box>

            <Box sx={{ height: '1px', backgroundColor: 'divider', my: 3 }} />

            {/* Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleFormChange} placeholder="Your full name" size="medium" required disabled={submitting} />
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="you@example.com" size="medium" required disabled={submitting} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="+1 (555) 000-0000" size="medium" required disabled={submitting} />
                <TextField fullWidth label="Company" name="company" value={formData.company} onChange={handleFormChange} placeholder="Where do you work?" size="medium" disabled={submitting} />
              </Box>
              <TextField
                fullWidth label="Reason" name="reason" value={formData.reason} onChange={handleFormChange}
                placeholder="What would you like to discuss? Please be as specific as possible."
                size="medium" required disabled={submitting}
                multiline minRows={3}
              />

              {/* Invite others */}
              <Box>
                <Box
                  sx={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75,
                    p: inviteEmails.length ? 1 : 0,
                  }}
                >
                  {inviteEmails.map((em) => (
                    <Chip
                      key={em}
                      label={em}
                      size="small"
                      onDelete={() => setInviteEmails(prev => prev.filter(x => x !== em))}
                      disabled={submitting}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  label="Invite others"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={handleInviteKeyDown}
                  onBlur={commitInvite}
                  placeholder="Enter email and press Enter"
                  size="medium"
                  disabled={submitting}
                  inputProps={{ 'data-testid': 'invite-input', type: 'email' }}
                  helperText="Optional — invite colleagues or teammates to this meeting."
                />
              </Box>

              {submitError && (
                <Box data-testid="booking-error" sx={{ p: 1.5, borderRadius: 1, backgroundColor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.light', color: 'error.contrastText' }}>
                  <Typography variant="body2">{submitError}</Typography>
                </Box>
              )}

              <Button type="submit" variant="contained" size="large" disabled={!isSubmitEnabled || submitting} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                {submitting ? <CircularProgress size={22} color="inherit" /> : 'Book Appointment'}
              </Button>
              <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                You&apos;ll receive a confirmation email with a calendar invite.
              </Typography>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
