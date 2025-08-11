'use client';

import { LoadingScreen } from './components/LoadingScreen';
import { Home } from './components/Home';

export default function Page() {
  return (
    <>
      <LoadingScreen />
      <Home />
    </>
  );
}
