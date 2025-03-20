import * as React from 'react';
import DemoToolbarRoot from '../DemoToolbarRoot';

function DemoToolbarFallback() {
  return <DemoToolbarRoot demoOptions={{}} openDemoSource={() => {}}>Loading...</DemoToolbarRoot>;
}

export default DemoToolbarFallback;
