import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';

interface Example {
  name: string;
  label: string;
  tsLabel?: string;
  link: string;
  tsLink?: string;
  src: string | React.ReactNode;
}

const examples: Example[] = [
  // ... existing data ...
];

export default function MaterialUIExampleCollection() {
  return (
    <Grid container spacing={2}>
      {examples.map((example) => (
        <Grid key={example.name} xs={12} sm={6}>
          <Paper
            variant="outlined"
            sx={(theme) => ({
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: `${theme.palette.gradients.radioSubtle}`,
            })}
          >
            <Avatar
              alt={example.name}
              imgProps={{
                width: '38',
                height: '38',
                loading: 'lazy',
              }}
              {...(typeof example.src === 'string'
                ? { src: example.src }
                : { children: example.src })}
            />
            <div>
              <Typography fontWeight="medium" className="algolia-lvl3">
                {example.name}
              </Typography>
              <Box
                data-ga-event-category="material-ui-example"
                data-ga-event-label={example.name}
                data-ga-event-action="click"
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  mt: 0.5,
                  gap: 0.2,
                }}
              >
                <Link
                  href={example.link}
                  variant="body2"
                  sx={{
                    '& > svg': { transition: '0.2s' },
                    '&:hover > svg': { transform: 'translateX(2px)' },
                  }}
                >
                  {example.label}
                  <ChevronRightRoundedIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                </Link>
                {!!example.tsLink && (
                  <React.Fragment>
                    <Typography
                      variant="caption"
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        opacity: 0.1,
                        mr: 1,
                      }}
                    >
                      /
                    </Typography>
                    <Link
                      href={example.tsLink}
                      variant="body2"
                      sx={{
                        '& > svg': { transition: '0.2s' },
                        '&:hover > svg': { transform: 'translateX(2px)' },
                      }}
                    >
                      {example.tsLabel}
                      <ChevronRightRoundedIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                    </Link>
                  </React.Fragment>
                )}
              </Box>
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
