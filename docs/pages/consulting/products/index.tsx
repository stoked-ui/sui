import * as React from 'react';
import { useRouter } from 'next/router';
import { toAbsoluteSitePath } from 'docs/src/modules/utils/siteRouting';

export default function ProductsRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace(toAbsoluteSitePath('consulting', '/consulting/admin/products'));
  }, [router]);

  return null;
}
