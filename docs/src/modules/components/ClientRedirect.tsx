import * as React from 'react';
import { useRouter } from 'next/router';

export default function ClientRedirect({ href }: { href: string }) {
  const router = useRouter();

  React.useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return null;
}
