/* eslint-disable material-ui/no-hardcoded-labels */
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { useTranslate } from '@mui/docs/i18n';

interface Layout {
  title: string;
  description: string;
  src: string;
  href: string;
  source: string;
}

const sourcePrefix = `${process.env.SOURCE_CODE_REPO}/tree/v${process.env.LIB_VERSION}`;

function layouts(t: (key: string) => string): Layout[] {
  return [
    // ... existing data ...
  ];
}

export default function Templates() {
  const t = useTranslate();

  return (
    <Grid container spacing={2} sx={{ py: 2 }}>
      {layouts(t).map((layout) => (
        <Grid item xs={12} sm={6} key={layout.title}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderColor: 'divider',
            }}
          >
            <CardMedia
              component="img"
              image={layout.src}
              title={layout.title}
              sx={{
                aspectRatio: '16 / 9',
                objectPosition: 'top',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Box sx={{ p: 2, pt: 1.5 }}>
              <Typography component="h3" variant="body1" fontWeight="semiBold">
                {layout.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {layout.description}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  mt: 'auto',
                }}
              >
                <Button
                  component="a"
                  href={layout.href}
                  size="small"
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<Visibility sx={{ mr: 0.5 }} />}
                  data-ga-event-category="material-ui-template"
                  data-ga-event-label={layout.title}
                  data-ga-event-action="preview-img"
                >
                  Live preview
                </Button>
                <Button
                  component="a"
                  href={layout.source}
                  size="small"
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<CodeRoundedIcon sx={{ mr: 0.5 }} />}
                >
                  Source code
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
