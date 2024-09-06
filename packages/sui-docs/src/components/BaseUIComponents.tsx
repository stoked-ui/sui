import * as React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Link } from '../Link';

interface Component {
  title: string;
  srcLight: string;
  srcDark: string;
  href: string;
}

function components(): Component[] {
  return [
    {
      title: 'Autocomplete',
      srcLight: '/static/base-ui/react-components/autocomplete-light.png',
      srcDark: '/static/base-ui/react-components/autocomplete-dark.png',
      href: '/base-ui/react-autocomplete/',
    },
    // ... (keep other components)
  ];
}

function BaseUIComponents(): React.ReactElement {
  return (
    <Grid container spacing={2} sx={{ pt: 2, pb: 4 }}>
      {components().map((component, index) => (
        <Grid item xs={12} sm={4} sx={{ flexGrow: 1 }} key={component.title}>
          <Card
            component={Link}
            noLinkStyle
            prefetch={false}
            variant="outlined"
            href={component.href}
            sx={(theme) => ({
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 1,
              borderColor: 'divider',
              ...theme.applyDarkStyles({
                backgroundColor: `${alpha(theme.palette.primaryDark[700], 0.3)}`,
                borderColor: 'divider',
              }),
            })}
          >
            <CardMedia
              component="img"
              alt=""
              loading={index <= 5 ? 'eager' : 'lazy'}
              image={component.srcLight}
              sx={(theme) => ({
                aspectRatio: '16 / 9',
                background: `${theme.palette.gradients.linearSubtle}`,
                borderBottom: '1px solid',
                borderColor: 'divider',
                ...theme.applyDarkStyles({
                  content: `url(${component.srcDark})`,
                  background: `${theme.palette.gradients.linearSubtle}`,
                  borderColor: 'divider',
                }),
              })}
            />
            <Typography
              component="h2"
              variant="body2"
              fontWeight="semiBold"
              sx={{ px: 2, py: 1.5 }}
            >
              {component.title}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default BaseUIComponents;
