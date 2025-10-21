/**
 * Font loading strategy for handling network issues during build
 */

export const FONT_LOADING_STRATEGY = {
  // Use system fonts as fallback
  FALLBACK_FONTS: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  },
  
  // Font loading timeout
  TIMEOUT: 5000,
  
  // Retry attempts
  MAX_RETRIES: 3
};

export const createFontLoadingCSS = () => {
  return `
    /* Font loading strategy CSS */
    :root {
      --font-geist-sans: 'Geist', ${FONT_LOADING_STRATEGY.FALLBACK_FONTS.sans};
      --font-geist-mono: 'Geist Mono', ${FONT_LOADING_STRATEGY.FALLBACK_FONTS.mono};
    }
    
    /* Font loading fallback classes */
    .font-sans {
      font-family: var(--font-geist-sans);
    }
    
    .font-mono {
      font-family: var(--font-geist-mono);
    }
    
    /* Font loading animation */
    @keyframes font-loading {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    .font-loading {
      animation: font-loading 0.3s ease-in-out;
    }
  `;
};

export const loadFontsWithFallback = async (): Promise<boolean> => {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    // Check if fonts are already loaded
    if (document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Font loading timeout')), FONT_LOADING_STRATEGY.TIMEOUT)
        )
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Font loading failed, using fallbacks:', error);
    return false;
  }
};

export const injectFontFallbackCSS = () => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = createFontLoadingCSS();
  style.id = 'font-fallback-css';
  
  // Remove existing style if it exists
  const existingStyle = document.getElementById('font-fallback-css');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(style);
};