import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Unstable_Grid2';
import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link } from '@stoked-ui/docs';
import ROUTES from 'docs/src/route';
import Section from 'docs/src/layouts/Section';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import GradientText from 'docs/src/components/typography/GradientText';
import teamMembers from 'docs/data/about/teamMembers.json';
/**
 * The teamMembers data can be imported from: https://tools-public.mui.com/prod/pages/nSwYn51

curl 'https://tools-public.mui.com/prod/api/data/muicomabout/queryAbout' \
  -H 'content-type: application/json' \
  --data-raw '{}' \
  --compressed
*/

interface Profile {
  name: string;
  /**
   * Role, what are you working on?
   */
  title: string;
  /**
   * Country where you live in, ISO 3166-1.
   */
  locationCountry: string; // https://flagpedia.net/download/api
  /**
   * Image URL.
   */
  src?: string;
  /**
   * Lives in.
   */
  location?: string;
  /**
   * Short summary about you.
   */
  about?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

function Person(props: Profile & { sx?: PaperProps['sx'] }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', ...props.sx }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          '& > div': { minWidth: 'clamp(0px, (150px - 100%) * 999 ,100%)' },
        }}
      >
        <Tooltip
          title={props.location || false}
          placement="right-end"
          describeChild
          PopperProps={{
            popperOptions: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [3, 2],
                  },
                },
              ],
            },
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              variant="rounded"
              imgProps={{
                width: '70',
                height: '70',
                loading: 'lazy',
              }}
              src={props.src}
              alt={props.name}
              {...(props.src?.startsWith('https://avatars.githubusercontent.com') && {
                src: `${props.src}?s=70`,
                srcSet: `${props.src}?s=140 2x`,
              })}
              sx={(theme) => ({
                width: 70,
                height: 70,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.100',
                backgroundColor: 'primary.50',
                ...theme.applyDarkStyles({
                  backgroundColor: 'primary.900',
                  borderColor: 'primaryDark.500',
                }),
              })}
            />
            <Box
              sx={(theme) => ({
                width: 24,
                height: 24,
                display: 'flex',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#FFF',
                borderRadius: 40,
                border: '2px solid',
                borderColor: 'primary.50',
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                transform: 'translateX(50%)',
                overflow: 'hidden',
                ...theme.applyDarkStyles({
                  borderColor: 'primary.200',
                }),
              })}
            >
              <img
                loading="lazy"
                height="20"
                width="40"
                src={`https://flagcdn.com/${props.locationCountry}.svg`}
                alt=""
              />
            </Box>
          </Box>
        </Tooltip>
        <Box sx={{ mt: -0.5, mr: -0.5, ml: 'auto' }}>
          {props.github && (
            <IconButton
              aria-label={`${props.name} GitHub profile`}
              component="a"
              href={`https://github.com/${props.github}`}
              target="_blank"
              rel="noopener"
            >
              <GitHubIcon fontSize="small" sx={{ color: 'grey.500' }} />
            </IconButton>
          )}
          {props.twitter && (
            <IconButton
              aria-label={`${props.name} X profile`}
              component="a"
              href={`https://x.com/${props.twitter}`}
              target="_blank"
              rel="noopener"
            >
              <XIcon fontSize="small" sx={{ color: 'grey.500' }} />
            </IconButton>
          )}
          {props.linkedin && (
            <IconButton
              aria-label={`${props.name} LinkedIn profile`}
              component="a"
              href={`https://www.linkedin.com/${props.linkedin}`}
              target="_blank"
              rel="noopener"
            >
              <LinkedInIcon fontSize="small" sx={{ color: 'grey.500' }} />
            </IconButton>
          )}
        </Box>
      </Box>
      <Typography variant="body2" fontWeight="bold" sx={{ mt: 2, mb: 0.5 }}>
        {props.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {props.title}
      </Typography>
      {props.about && <Divider sx={{ my: 1.5 }} />}
      {props.about && (
        <Typography variant="body2" color="text.tertiary">
          {props.about}
        </Typography>
      )}
    </Paper>
  );
}

const contributors = [
  {
    name: 'Sebastian Silbermann',
    github: 'eps1lon',
    title: 'Material UI, everything Open Source',
    location: 'Berlin, Germany',
    locationCountry: 'de',
    src: 'https://avatars.githubusercontent.com/u/12292047',
    twitter: 'sebsilbermann',
  },
  {
    name: 'Ryan Cogswell',
    github: 'ryancogswell',
    title: 'Stack Overflow top contributor',
    location: 'Minnesota, United States',
    locationCountry: 'us',
    src: 'https://avatars.githubusercontent.com/u/287804',
  },
  {
    name: 'Yan Lee',
    github: 'AGDholo',
    title: 'Chinese docs',
    location: 'China',
    locationCountry: 'cn',
    src: 'https://avatars.githubusercontent.com/u/13300332',
  },
  {
    name: 'Jairon Alves Lima',
    github: 'jaironalves',
    title: 'Brazilian Portuguese docs',
    location: 'São Paulo, Brazil',
    locationCountry: 'br',
    src: 'https://avatars.githubusercontent.com/u/29267813',
  },
  {
    name: 'Danica Shen',
    github: 'DDDDDanica',
    title: 'Chinese docs',
    location: 'Ireland',
    locationCountry: 'ie',
    src: 'https://avatars.githubusercontent.com/u/12678455',
  },
];

const emeriti = [
  {
    name: 'Hai Nguyen',
    github: 'hai-cea',
    twitter: 'haicea',
    title: 'Material UI, v0.x creator',
    location: 'Dallas, US',
    locationCountry: 'us',
    src: 'https://avatars.githubusercontent.com/u/2007468',
  },
  {
    name: 'Nathan Marks',
    github: 'nathanmarks',
    title: 'Material UI, v1.x co-creator',
    location: 'Toronto, CA',
    locationCountry: 'ca',
    src: 'https://avatars.githubusercontent.com/u/4420103',
  },
  {
    name: 'Kevin Ross',
    github: 'rosskevin',
    twitter: 'rosskevin',
    title: 'Material UI, flow',
    location: 'Franklin, US',
    locationCountry: 'us',
    src: 'https://avatars.githubusercontent.com/u/136564',
  },
  {
    name: 'Sebastian Sebald',
    github: 'sebald',
    twitter: 'sebastiansebald',
    title: 'Material UI',
    location: 'Freiburg, Germany',
    locationCountry: 'de',
    src: 'https://avatars.githubusercontent.com/u/985701',
  },
  {
    name: 'Ken Gregory',
    github: 'kgregory',
    title: 'Material UI',
    location: 'New Jersey, US',
    locationCountry: 'us',
    src: 'https://avatars.githubusercontent.com/u/3155127',
  },
  {
    name: 'Tom Crockett',
    github: 'pelotom',
    twitter: 'pelotom',
    title: 'Material UI',
    location: 'Los Angeles, US',
    locationCountry: 'us',
    src: 'https://avatars.githubusercontent.com/u/128019',
  },
  {
    name: 'Maik Marschner',
    github: 'leMaik',
    twitter: 'leMaikOfficial',
    title: 'Material UI',
    location: 'Hannover, Germany',
    locationCountry: 'de',
    src: 'https://avatars.githubusercontent.com/u/5544859',
  },
  {
    name: 'Oleg Slobodskoi',
    github: 'kof',
    twitter: 'oleg008',
    title: 'Material UI, JSS',
    location: 'Berlin, Germany',
    locationCountry: 'de',
    src: 'https://avatars.githubusercontent.com/u/52824',
  },
  {
    name: 'Dmitriy Kovalenko',
    github: 'dmtrKovalenko',
    twitter: 'goose_plus_plus',
    title: 'SUI X Date Pickers',
    location: 'Kharkiv, Ukraine',
    locationCountry: 'ua',
    src: 'https://avatars.githubusercontent.com/u/16926049',
  },
  {
    name: 'Josh Wooding',
    github: 'joshwooding',
    twitter: 'JoshWooding_',
    title: 'Material UI, J.P. Morgan',
    location: 'London, UK',
    locationCountry: 'gb',
    src: 'https://avatars.githubusercontent.com/u/12938082',
  },
];

export default function Team() {
  return (
    <Section cozy>
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SectionHeadline
            overline="Team"
            title={
              <Typography variant="h2" id="muiers">
                Meet the <GradientText>SUIers</GradientText>
              </Typography>
            }
            description="Contributing from all corners of the world, SUI is a global, fully-remote team & community."
          />
        </Box>
        <Grid container spacing={2}>
          {(teamMembers as Array<Profile>).map((profileJson) => {
            const profile = {
              src: `/static/branding/about/${profileJson.name
                .split(' ')
                .map((x) => x.toLowerCase())
                .join('-')}.png`,
              ...profileJson,
            };
            return (
              <Grid key={profile.name} xs={12} sm={6} md={3}>
                <Person {...profile} />
              </Grid>
            );
          })}
        </Grid>
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        <SectionHeadline
          overline="Team"
          title={
            <Typography variant="h2" id="muiers">
              <GradientText>MUI</GradientText> & Community
            </Typography>
          }
          description=""
        />
          <Typography variant="body1" id="muiers">
            Stoked UI is built on top of MUI which is a massive open source project with a huge team. <Link href={'https://mui.com/about/'}>View the MUI Team here</Link>
          </Typography>
        </Box>
      </Section>
  );
}
