import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/system';
import { WebUserDirectChat } from '@stoked-ui/media';
import AppLayoutDocs from '../../../src/modules/components/AppLayoutDocs';
import RichMarkdownElement from '../../../src/modules/components/RichMarkdownElement';
import { getApiUrl } from '../../../src/modules/utils/getApiUrl';
import { useUserLanguage } from '@stoked-ui/docs/i18n';
import * as pageProps from '../../../data/stoked-ui/support/support.md?muiMarkdown';

export default function Page() {
  const theme = useTheme();
  const userLanguage = useUserLanguage();
  const localizedDoc = pageProps.docs[userLanguage] || pageProps.docs.en;

  return (
    <AppLayoutDocs
      cardOptions={{
        description: localizedDoc.headers.cardDescription,
        title: localizedDoc.headers.cardTitle,
      }}
      description={localizedDoc.description}
      disableAd
      location={localizedDoc.location}
      title={localizedDoc.title}
      toc={localizedDoc.toc}
    >
      {localizedDoc.rendered.map((renderedMarkdownOrDemo, index) => (
        <RichMarkdownElement
          key={`demos-section-${index}`}
          demoComponents={pageProps.demoComponents}
          demos={pageProps.demos || {}}
          disableAd
          localizedDoc={localizedDoc}
          renderedMarkdownOrDemo={renderedMarkdownOrDemo}
          srcComponents={pageProps.srcComponents}
          theme={theme}
          WrapperComponent={React.Fragment}
          wrapperProps={{}}
        />
      ))}
      <Box
        id="direct-support"
        sx={(theme) => ({
          mt: { xs: 6, md: 8 },
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: { xs: 4, md: 5 },
        })}
      >
        <Box
          sx={(theme) => ({
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 3, md: 4 },
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(14, 21, 32, 0.96), rgba(8, 13, 21, 0.96))'
                : 'linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(255, 255, 255, 1))',
          })}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
          >
            Direct support
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, mb: 1.5, fontWeight: 700 }}>
            Talk to support
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: '72ch', mb: 3 }}>
            Start the conversation here. This chat routes straight to our Telegram support inbox and
            will collect the minimum details we need to reply without turning it into a ticket form.
          </Typography>
          <WebUserDirectChat
            provider="telegram"
            apiEndpoint={getApiUrl('/api/chat/send')}
            title="Chat with support"
            subtitle="Tell us what you need and we will route it to the right person."
            sx={{
              maxWidth: 560,
              mx: 0,
              p: 0,
              boxShadow: 'none',
              backgroundColor: 'transparent',
            }}
          />
        </Box>
      </Box>
    </AppLayoutDocs>
  );
}
