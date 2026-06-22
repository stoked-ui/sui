import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CalendarBooking from '../CalendarBooking';

jest.mock('@mui/material/styles', () => {
  const actual = jest.requireActual('@mui/material/styles');
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        mode: 'light',
        primary: { main: '#1976d2', dark: '#115293', contrastText: '#fff' },
        text: { primary: '#000', secondary: '#666', disabled: '#aaa' },
        action: { hover: 'rgba(0,0,0,0.04)' },
        divider: 'rgba(0,0,0,0.12)',
        success: { light: '#e8f5e9', dark: '#1b5e20', contrastText: '#000' },
        error: { light: '#ffebee', dark: '#b71c1c', contrastText: '#000' },
      },
      breakpoints: { down: () => '(max-width:599.95px)', up: () => '(min-width:600px)' },
    }),
  };
});

let errorSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;
beforeAll(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => {
  errorSpy.mockRestore();
  warnSpy.mockRestore();
});

// Availability is cached in sessionStorage (30-min TTL). Clear it between tests
// so each render starts from a cold cache and re-fetches.
beforeEach(() => {
  window.sessionStorage.clear();
});

// Returns an ISO string for date YYYY-MM-DD at 10:30 AM local time
function slotAt1030(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 10, 30, 0, 0).toISOString();
}

// Mock fetch: return a 10:30 slot for any availability request, empty for others
function mockFetchWithSlots() {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    const match = (url as string).match(/date=(\d{4}-\d{2}-\d{2})/);
    if (match && (url as string).includes('/api/calendar/availability')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ slots: [slotAt1030(match[1])] }),
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({ slots: [] }) });
  });
}

// ── Duration snap math ────────────────────────────────────────────────────────

describe('duration snap math', () => {
  const snap = (deltaY: number, start = 30) => {
    const delta = Math.round((deltaY * 0.5) / 15) * 15;
    return Math.max(30, Math.min(120, start + delta));
  };

  it('30px down → 45 min', () => expect(snap(30)).toBe(45));

  it('60px down → 60 min', () => expect(snap(60)).toBe(60));

  it('500px up → clamps to 30 min', () => expect(snap(-500)).toBe(30));

  it('600px down → clamps to 120 min', () => expect(snap(600)).toBe(120));

  it('from 45 min, 30px down → 60 min', () => expect(snap(30, 45)).toBe(60));
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('CalendarBooking rendering', () => {
  beforeEach(() => mockFetchWithSlots());

  afterEach(() => jest.restoreAllMocks());

  it('renders mini-calendar and week-grid', () => {
    render(<CalendarBooking />);
    expect(screen.getByTestId('mini-calendar')).toBeTruthy();
    expect(screen.getByTestId('week-grid')).toBeTruthy();
  });

  it('renders exactly 5 day-column-header elements (Mon–Fri)', () => {
    render(<CalendarBooking />);
    expect(screen.getAllByTestId('day-column-header')).toHaveLength(5);
  });

  it('does not render booking-form on initial load', () => {
    render(<CalendarBooking />);
    expect(screen.queryByTestId('booking-form')).toBeNull();
  });
});

// ── Window & default selection ────────────────────────────────────────────────

const businessToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());

const businessTodayDayNum = () =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', day: 'numeric' }).format(new Date());

describe('CalendarBooking window & default selection', () => {
  beforeEach(() => mockFetchWithSlots());

  afterEach(() => jest.restoreAllMocks());

  it('selects today in the mini calendar on load', () => {
    render(<CalendarBooking />);
    const selected = screen.getAllByTestId('mini-cal-cell').filter(
      (c) => c.getAttribute('data-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toBe(businessTodayDayNum());
  });

  it('first day column is the next available weekday (no weekend, not before today)', () => {
    render(<CalendarBooking />);
    const cols = document.querySelectorAll('[data-day-column]');
    expect(cols.length).toBe(5);
    const firstDate = cols[0].getAttribute('data-day-column')!;
    const [y, m, d] = firstDate.split('-').map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    expect(dow === 0 || dow === 6).toBe(false);
    expect(firstDate >= businessToday()).toBe(true);
  });

  it('renders no weekend columns', () => {
    render(<CalendarBooking />);
    const cols = Array.from(document.querySelectorAll('[data-day-column]'));
    for (const col of cols) {
      const [y, m, d] = col.getAttribute('data-day-column')!.split('-').map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      expect(dow === 0 || dow === 6).toBe(false);
    }
  });

  it('mini calendar headers start on Sunday and end on Saturday', () => {
    render(<CalendarBooking />);
    const mini = screen.getByTestId('mini-calendar');
    // Weekday headers are the single-character caption spans (month label is longer,
    // day numbers render inside divs)
    const labels = Array.from(mini.querySelectorAll('span'))
      .map((s) => s.textContent || '')
      .filter((t) => t.length === 1)
      .slice(0, 7);
    expect(labels).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });
});

// ── Availability cache (sessionStorage, 30-min TTL) ───────────────────────────

function availabilityCallCount(): number {
  return (global.fetch as jest.Mock).mock.calls.filter(
    (c: string[]) => c[0].includes('/api/calendar/availability'),
  ).length;
}

describe('CalendarBooking availability cache', () => {
  beforeEach(() => mockFetchWithSlots());

  afterEach(() => jest.restoreAllMocks());

  it('does not re-fetch availability for the same dates within the TTL', async () => {
    const { unmount } = render(<CalendarBooking apiBaseUrl="" />);
    await waitFor(() => expect(availabilityCallCount()).toBeGreaterThan(0), { timeout: 3000 });
    const firstCount = availabilityCallCount();
    unmount();
    // Re-mount with a warm sessionStorage cache (not cleared mid-test)
    render(<CalendarBooking apiBaseUrl="" />);
    await act(async () => { await Promise.resolve(); });
    await waitFor(() => expect(screen.getByTestId('mini-calendar')).toBeTruthy());
    expect(availabilityCallCount()).toBe(firstCount);
  });
});

// ── Slot loading ──────────────────────────────────────────────────────────────

describe('CalendarBooking slot loading', () => {
  beforeEach(() => mockFetchWithSlots());

  afterEach(() => jest.restoreAllMocks());

  it('fetches /api/calendar/availability on mount', async () => {
    render(<CalendarBooking apiBaseUrl="" />);
    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.some(
        (c: string[]) => c[0].includes('/api/calendar/availability')
      )).toBe(true);
    });
  });

  it('shows time-slot elements after availability resolves', async () => {
    render(<CalendarBooking apiBaseUrl="" />);
    await waitFor(
      () => expect(screen.getAllByTestId('time-slot').length).toBeGreaterThan(0),
      { timeout: 3000 },
    );
  });
});

// ── Slot selection ────────────────────────────────────────────────────────────

describe('CalendarBooking slot selection', () => {
  beforeEach(() => mockFetchWithSlots());

  afterEach(() => jest.restoreAllMocks());

  async function clickFirstSlot() {
    render(<CalendarBooking apiBaseUrl="" />);
    const slot = await waitFor(
      () => screen.getAllByTestId('time-slot')[0],
      { timeout: 3000 },
    );
    fireEvent.click(slot);
    return slot;
  }

  it('clicking a slot sets data-selected="true"', async () => {
    const slot = await clickFirstSlot();
    expect(slot.getAttribute('data-selected')).toBe('true');
  });

  it('clicking a slot shows booking-form', async () => {
    await clickFirstSlot();
    expect(screen.getByTestId('booking-form')).toBeTruthy();
  });

  it('duration-display shows 30 after slot click', async () => {
    await clickFirstSlot();
    expect(screen.getByTestId('duration-display').textContent).toContain('30');
  });

  it('duration-drag-handle-bottom is inside week-grid after slot click', async () => {
    await clickFirstSlot();
    const grid = screen.getByTestId('week-grid');
    const handle = screen.getByTestId('duration-drag-handle-bottom');
    expect(grid.contains(handle)).toBe(true);
  });

  it('duration-drag-handle-bottom is NOT inside booking-form', async () => {
    await clickFirstSlot();
    const form = screen.getByTestId('booking-form');
    expect(form.contains(screen.getByTestId('duration-drag-handle-bottom'))).toBe(false);
  });
});

// ── Form validation ───────────────────────────────────────────────────────────

describe('CalendarBooking form validation', () => {
  beforeEach(() => mockFetchWithSlots());

  afterEach(() => jest.restoreAllMocks());

  async function clickFirstSlot() {
    render(<CalendarBooking apiBaseUrl="" />);
    const slot = await waitFor(
      () => screen.getAllByTestId('time-slot')[0],
      { timeout: 3000 },
    );
    fireEvent.click(slot);
  }

  it('submit button disabled before fields filled', async () => {
    await clickFirstSlot();
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeDisabled();
  });

  it('submit disabled with only name', async () => {
    await clickFirstSlot();
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Jane' } });
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeDisabled();
  });

  it('submit disabled with name + email + phone but no reason', async () => {
    await clickFirstSlot();
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'j@x.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /phone/i }), { target: { value: '555' } });
    expect(screen.getByRole('button', { name: /book appointment/i })).toBeDisabled();
  });

  it('submit enabled when name + email + phone + reason filled', async () => {
    await clickFirstSlot();
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'j@x.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /phone/i }), { target: { value: '555' } });
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), { target: { value: 'Discuss project' } });
    expect(screen.getByRole('button', { name: /book appointment/i })).not.toBeDisabled();
  });

  it('company optional — submit enabled without it when reason is set', async () => {
    await clickFirstSlot();
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'j@x.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /phone/i }), { target: { value: '555' } });
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), { target: { value: 'Discuss project' } });
    expect(screen.getByRole('button', { name: /book appointment/i })).not.toBeDisabled();
  });

  it('adds an invitee chip when an email is entered and Enter pressed', async () => {
    await clickFirstSlot();
    const invite = screen.getByTestId('invite-input');
    fireEvent.change(invite, { target: { value: 'guest@example.com' } });
    fireEvent.keyDown(invite, { key: 'Enter' });
    expect(screen.getByText('guest@example.com')).toBeTruthy();
  });

  it('shows booking-success after successful submit', async () => {
    await clickFirstSlot();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if ((url as string).includes('/api/calendar/book')) {
        return Promise.resolve({ ok: true, json: async () => ({ eventId: 'evt-1', eventLink: 'https://cal.test' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ slots: [] }) });
    });
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'j@x.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /phone/i }), { target: { value: '555' } });
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), { target: { value: 'Discuss project' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /book appointment/i })); });
    await waitFor(() => expect(screen.getByTestId('booking-success')).toBeTruthy(), { timeout: 3000 });
  });

  it('shows booking-error when booking API returns 500', async () => {
    await clickFirstSlot();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if ((url as string).includes('/api/calendar/book')) {
        return Promise.resolve({ ok: false, json: async () => ({ error: 'Server error' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ slots: [] }) });
    });
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'j@x.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /phone/i }), { target: { value: '555' } });
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), { target: { value: 'Discuss project' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /book appointment/i })); });
    await waitFor(() => expect(screen.getByTestId('booking-error')).toBeTruthy(), { timeout: 3000 });
  });
});
