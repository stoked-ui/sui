import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import type { CalendarBookingProps, BookingFormData, AvailabilitySlot } from './CalendarBooking.types';

export default function CalendarBooking({ apiBaseUrl, onSuccess, onError }: CalendarBookingProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState(30);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    reason: '',
    durationMinutes: 30,
  });

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailability = async () => {
      setLoading(true);
      setError('');
      setSelectedTime('');
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/calendar/availability?date=${selectedDate}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch availability');
        }

        const availableSlots: AvailabilitySlot[] = (data.slots || []).map((slot: string) => {
          const date = new Date(slot);
          return {
            time: slot,
            label: date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
          };
        });

        setSlots(availableSlots);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch slots';
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, apiBaseUrl, onError]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDurationDrag = (e: React.MouseEvent, slotIndex: number) => {
    if (e.button !== 0) return; // Only left-click

    setDragStart(slotIndex);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentSlot = slots[slotIndex];
      const nextSlot = slots[slotIndex + 1];

      if (!currentSlot || !nextSlot) return;

      const currentTime = new Date(currentSlot.time);
      const nextTime = new Date(nextSlot.time);

      const diffMinutes = (nextTime.getTime() - currentTime.getTime()) / (1000 * 60);

      // Snap to nearest 15min increment from 30 to 120 minutes
      let newDuration = Math.round(duration + diffMinutes / 15) * 15;
      newDuration = Math.max(30, Math.min(120, newDuration));

      setDuration(newDuration);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setDragStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Name, email, and phone are required');
      return;
    }

    if (!selectedTime) {
      setError('Please select a time');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/calendar/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          reason: formData.reason,
          startTime: selectedTime,
          durationMinutes: duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', company: '', reason: '', durationMinutes: 30 });
      setSelectedDate('');
      setSelectedTime('');
      setDuration(30);

      onSuccess?.(data.eventId, data.eventLink);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to book appointment';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Appointment booked successfully! Check your email for confirmation.
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Form Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Your Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                required
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone *"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                required
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company (optional)"
                name="company"
                value={formData.company}
                onChange={handleFormChange}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reason (optional)"
                name="reason"
                value={formData.reason}
                onChange={handleFormChange}
                disabled={loading}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Date Selection */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Select Date & Time
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={loading}
            inputProps={{
              min: getMinDate(),
              max: getMaxDate(),
            }}
            size="small"
            sx={{ mb: 2 }}
          />

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {!loading && selectedDate && slots.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Available times (click to select)
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: 1,
                  mb: 3,
                }}
              >
                {slots.map((slot, idx) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? 'contained' : 'outlined'}
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={loading}
                    size="small"
                    sx={{
                      position: 'relative',
                      overflow: 'visible',
                      textTransform: 'none',
                    }}
                    onMouseDown={(e) => {
                      if (idx < slots.length - 1) {
                        handleDurationDrag(e, idx);
                      }
                    }}
                  >
                    {slot.label}
                    {selectedTime === slot.time && idx < slots.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -4,
                          top: '50%',
                          width: 8,
                          height: 16,
                          backgroundColor: 'primary.main',
                          borderRadius: '4px',
                          cursor: 'ew-resize',
                          transform: 'translateY(-50%)',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                      />
                    )}
                  </Button>
                ))}
              </Box>

              {selectedTime && (
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Duration:</strong> {duration} minutes
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Drag the right edge to adjust by 15 min increments (30–120 min)
                  </Typography>
                </Paper>
              )}
            </>
          )}

          {!loading && selectedDate && slots.length === 0 && (
            <Alert severity="info">No available slots for this date. Please select another date.</Alert>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={!formData.name || !formData.email || !formData.phone || !selectedTime || loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
        </Button>
      </Box>
    </Box>
  );
}
