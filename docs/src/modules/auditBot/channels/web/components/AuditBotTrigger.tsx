import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface AuditBotTriggerProps {
  variant?: 'hero' | 'card' | 'inline';
  onOpen: () => void;
}

export default function AuditBotTrigger({ variant = 'hero', onOpen }: AuditBotTriggerProps) {
  if (variant === 'inline') {
    return (
      <Button
        onClick={onOpen}
        size="large"
        variant="contained"
        endIcon={<KeyboardArrowRightIcon />}
        sx={{
          backgroundColor: '#3399ff',
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '1.05rem',
          px: 3,
          py: 1.25,
          '&:hover': { backgroundColor: '#1976d2' },
        }}
      >
        Start your free AI audit
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <Box
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        sx={[
          {
            cursor: 'pointer',
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            p: 3,
            transition: 'all 0.2s',
            bgcolor: 'background.paper',
            '&:hover': {
              borderColor: '#3399ff',
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          },
          (theme) => theme.applyDarkStyles({
            bgcolor: 'primaryDark.800',
            borderColor: 'primaryDark.700',
          }),
        ]}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#3399ff' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Free AI Readiness Audit
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Talk to an agent Brian built. 5 minutes. You walk away with the 3 highest-ROI places
          AI could actually save you time — written down, yours to keep.
        </Typography>
        <Button
          variant="contained"
          endIcon={<KeyboardArrowRightIcon />}
          sx={{
            backgroundColor: '#3399ff',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#1976d2' },
          }}
        >
          Start the audit
        </Button>
      </Box>
    );
  }

  // hero variant — large, with mocked chat preview above
  return (
    <Box
      sx={[
        {
          width: '100%',
          maxWidth: 560,
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: 8,
        },
        (theme) => theme.applyDarkStyles({
          bgcolor: 'primaryDark.800',
          borderColor: 'primaryDark.700',
        }),
      ]}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: '#22c55e',
            boxShadow: '0 0 8px #22c55e',
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Stokd Consulting AI Readiness Audit
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          5 min · Free
        </Typography>
      </Box>

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box
          sx={[
            {
              alignSelf: 'flex-start',
              maxWidth: '85%',
              px: 1.75,
              py: 1.25,
              borderRadius: 2,
              bgcolor: 'grey.100',
              fontSize: '0.9rem',
            },
            (theme) => theme.applyDarkStyles({ bgcolor: 'primaryDark.700' }),
          ]}
        >
          Hi — I&apos;m an AI agent Brian Stoker built. I run a quick, free audit
          and write you a 1-page report with the 3 best places AI would actually save you
          time. Yours to keep, no pitch required.
        </Box>
        <Box
          sx={[
            {
              alignSelf: 'flex-start',
              maxWidth: '85%',
              px: 1.75,
              py: 1.25,
              borderRadius: 2,
              bgcolor: 'grey.100',
              fontSize: '0.9rem',
            },
            (theme) => theme.applyDarkStyles({ bgcolor: 'primaryDark.700' }),
          ]}
        >
          To start: what does your business do, and what city are you based in?
        </Box>
        <Box sx={{ pt: 1.5 }}>
          <Button
            onClick={onOpen}
            fullWidth
            size="large"
            variant="contained"
            endIcon={<KeyboardArrowRightIcon />}
            sx={{
              backgroundColor: '#3399ff',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.25,
              '&:hover': { backgroundColor: '#1976d2' },
            }}
          >
            Start your audit
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            No signup. Brian sees the report too, on his phone.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
