'use client';

import { useEffect } from 'react';
import { initIntro } from './introAnimation';

/** Starts the hero animation after the homepage markup is in the page (also after client-side navigation). */
export function IntroInit() {
  useEffect(() => {
    initIntro();
  }, []);
  return null;
}
