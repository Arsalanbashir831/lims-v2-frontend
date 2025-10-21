/**
 * Font loading utilities for handling network issues during build
 */

export const FONT_FALLBACKS = {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace'
  ]
};

export const getFontFallback = (type: 'sans' | 'mono') => {
  return FONT_FALLBACKS[type].join(', ');
};

export const createFontCSS = () => {
  return `
    :root {
      --font-geist-sans: 'Geist', ${getFontFallback('sans')};
      --font-geist-mono: 'Geist Mono', ${getFontFallback('mono')};
    }
    
    .font-sans {
      font-family: var(--font-geist-sans);
    }
    
    .font-mono {
      font-family: var(--font-geist-mono);
    }
  `;
};

export const isFontLoadingSupported = () => {
  return typeof document !== 'undefined' && 'fonts' in document;
};

export const preloadFonts = async () => {
  if (!isFontLoadingSupported()) {
    return Promise.resolve();
  }

  try {
    await document.fonts.ready;
    return Promise.resolve();
  } catch (error) {
    console.warn('Font loading failed, using fallbacks:', error);
    return Promise.resolve();
  }
};
