/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import * as React from 'react';
import Home from "./home";
import Main from "./main";

export default function Page() {
  return <Home HomeMain={Main} />;
}
