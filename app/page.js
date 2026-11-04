'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

export default function Page() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/mapsok/sw.js', {
        scope: '/mapsok/',
      }).catch((error) => {
        console.error('Thumbnail service worker registration failed:', error);
      });
    }
  }, []);

  return <App />;
}
