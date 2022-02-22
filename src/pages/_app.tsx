import '../styles/globals.css';
import '../firebase.config';

import React, { ReactText, useEffect, HTMLAttributes } from 'react';
import '../styles/main.css';

// Core CSS required for Ionic components to work properly
import '@ionic/core/css/core.css';

import { JSX as LocalJSX } from '@ionic/core';
import { defineCustomElements as ionDefineCustomElements } from '@ionic/core/loader';
import { JSX as IoniconsJSX } from 'ionicons';
import type { AppProps } from 'next/app';

type ToReact<T> = {
  [P in keyof T]?: T[P] &
    Omit<HTMLAttributes<Element>, 'className'> & {
      class?: string;
      key?: ReactText;
    };
};

declare global {
  export namespace JSX {
    interface IntrinsicElements
      extends ToReact<
        LocalJSX.IntrinsicElements & IoniconsJSX.IntrinsicElements
      > {
      key?: string;
    }
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    ionDefineCustomElements(window);
  });

  return <Component {...pageProps} />;
}

export default MyApp;
