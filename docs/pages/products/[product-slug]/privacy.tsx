import { useRouter } from 'next/router';
import PublicLegalPage from 'docs/src/modules/components/PublicLegalPage';
import { GetStaticPaths, GetStaticProps } from 'next';

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: process.env.OPEN_NEXT_BUILD === 'true' ? 'blocking' : false,
});

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default function ProductPrivacyPage() {
  const router = useRouter();
  const productSlug = typeof router.query['product-slug'] === 'string' ? router.query['product-slug'] : undefined;

  return (
    <PublicLegalPage
      productSlug={productSlug}
      type="privacy"
      backHref={productSlug ? `/products/${productSlug}/` : '/products/'}
    />
  );
}
