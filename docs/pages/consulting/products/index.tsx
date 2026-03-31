import * as React from 'react';
import { useRouter } from 'next/router';

export default function ProductsRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/admin/products');
  }, [router]);

  return null;
}
