"use client";

import { useEffect, useState } from 'react';
import { loadFontsWithFallback, injectFontFallbackCSS } from '@/lib/font-loading';

export function FontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Inject font fallback CSS immediately
    injectFontFallbackCSS();
    
    // Try to load fonts with fallback handling
    loadFontsWithFallback()
      .then((loaded) => {
        setFontsLoaded(loaded);
      })
      .catch((error) => {
        console.warn('Font loading failed, using fallbacks:', error);
        setFontsLoaded(false);
      });
  }, []);

  return null;
}
