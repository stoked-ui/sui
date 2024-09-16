import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { Link } from '../Link';
import AppContainer from '../App/AppContainer';
import AppFooter from '../Layouts/AppFooter';
import AppHeader from '../Layouts/AppHeader';
import BrandingCssVarsProvider from '../branding/BrandingCssVarsProvider';
import MarkdownElement from '../Markdown/MarkdownElement';
import Products from '../Products';
import PageContext from "./PageContext";

const StyledDiv = styled('div')({
  flex: '1 0 100%',
});

const StyledAppContainer = styled(AppContainer)(({ theme }) => ({
  '& .markdownElement': {
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(4),
    },
  },
}));

type TopLayoutCareersProps = {
  docs: any,
  Head: React.JSX.ElementType,
}

export default function TopLayoutCareers(props: TopLayoutCareersProps) {
  const { docs, Head,  } = props;
  const { description, rendered, title } = docs.en;

  return (
    <BrandingCssVarsProvider>
      <AppHeader />
      <Head title={`${title} - SUI`} description={description}>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <StyledDiv>
        <StyledAppContainer component="main" sx={{ py: { xs: 3, sm: 4, md: 8 } }}>
          <Link
            href="/careers/#open-roles"
            rel="nofollow"
            variant="body2"
            sx={{ display: 'block', mb: 2 }}
          >
            {'< Back to open roles'}
          </Link>
          {rendered.map((chunk: any, index: number) => {
            return <MarkdownElement key={index} renderedMarkdown={chunk} />;
          })}
        </StyledAppContainer>
        <Divider />
        <AppFooter />
      </StyledDiv>
    </BrandingCssVarsProvider>
  );
}

TopLayoutCareers.propTypes = {
  docs: PropTypes.object.isRequired,
  Head: PropTypes.elementType.isRequired,
} as any;
