import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function Docs() {
  const router = useRouter();
  React.useEffect(() => {
    router.push('./docs/overview');
  }, []);
  return null;
}
