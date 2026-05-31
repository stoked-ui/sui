/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import * as React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Home from "./home";

const WEIGHTED_PAGES = [
  { weight: 10, key: 'front-end', loader: () => import('./front-end/main') },
  { weight: 10, key: 'back-end', loader: () => import('./back-end/main') },
  { weight: 10, key: 'full-stack', loader: () => import('./full-stack/main') },
  { weight: 20, key: 'devops', loader: () => import('./devops/main') },
  { weight: 50, key: 'ai', loader: () => import('./ai/main') },
];

const LoadingPlaceholder = () => <Box sx={{ minHeight: '60vh' }} />;

const DYNAMIC_COMPONENTS = WEIGHTED_PAGES.reduce((acc, entry) => {
  acc[entry.key] = dynamic(entry.loader, { ssr: false, loading: LoadingPlaceholder });
  return acc;
}, {});

function pickWeightedKey() {
  const total = WEIGHTED_PAGES.reduce((sum, it) => sum + it.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTED_PAGES.length; i += 1) {
    r -= WEIGHTED_PAGES[i].weight;
    if (r <= 0) return WEIGHTED_PAGES[i].key;
  }
  return WEIGHTED_PAGES[WEIGHTED_PAGES.length - 1].key;
}

function WeightedMain() {
  const [key, setKey] = React.useState(null);
  React.useEffect(() => {
    setKey(pickWeightedKey());
  }, []);
  if (!key) return <LoadingPlaceholder />;
  const Picked = DYNAMIC_COMPONENTS[key];
  return <Picked />;
}

export default function Page() {
  return <Home HomeMain={WeightedMain} />;
}
