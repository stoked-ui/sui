import { useRouter } from 'next/router';
import PublicProductDetailPage from 'docs/src/modules/components/PublicProductDetailPage';

import { GetStaticPaths, GetStaticProps } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: process.env.OPEN_NEXT_BUILD === 'true' ? 'blocking' : false,
  };
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default function ProductDetailRoute() {
  const router = useRouter();
  const productSlug = typeof router.query['product-slug'] === 'string' ? router.query['product-slug'] : undefined;

  if (!productSlug) {
    return null;
  }

  return <PublicProductDetailPage productSlug={productSlug} />;
}
