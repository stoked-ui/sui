import * as React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';

const ACCOUNT_NAV = [
  { label: 'Settings', href: '/consulting/settings' },
  { label: 'Licenses', href: '/consulting/licenses' },
  { label: 'Billing', href: '/consulting/billing' },
];

interface AccountPageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AccountPageShell(props: AccountPageShellProps) {
  const { title, description, children } = props;
  const router = useRouter();

  return (
    <React.Fragment>
      <Paper
        variant="outlined"
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: (theme) => (
            `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
          ),
        }}
      >
        <Stack spacing={2}>
          <div>
            <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.12em' }}>
              Account
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
              {description}
            </Typography>
          </div>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {ACCOUNT_NAV.map((item) => {
              const selected = router.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={selected ? 'contained' : 'outlined'}
                  onClick={() => router.push(item.href)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 999,
                    px: 2,
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      </Paper>
      {children}
    </React.Fragment>
  );
}
