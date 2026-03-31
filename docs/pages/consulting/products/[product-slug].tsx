import * as React from 'react';
import { useRouter } from 'next/router';
import PublicProductDetailPage from 'docs/src/modules/components/PublicProductDetailPage';
import { isConsultingPublicProductId, toAbsoluteSitePath } from 'docs/src/modules/utils/siteRouting';

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
  const isPublicProduct = isConsultingPublicProductId(productSlug);

  React.useEffect(() => {
    if (!isPublicProduct && productSlug) {
      router.replace(toAbsoluteSitePath('consulting', `/consulting/admin/products/${productSlug}`));
    }
  }, [isPublicProduct, productSlug, router]);

  if (isPublicProduct) {
    return <PublicProductDetailPage productSlug={productSlug} />;
  }

  return null;
}
