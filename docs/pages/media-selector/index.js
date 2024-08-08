import * as React from 'react';
import Home from "docs/pages";
import MainBac from "./main.bac";

export default function Page() {
  return <Home HomeMain={MainBac} />;
}
