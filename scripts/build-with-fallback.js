#!/usr/bin/env node

/**
 * Build script with font fallback handling
 * This script helps handle font loading issues during build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build with font fallback handling...');

try {
  // Create font fallback CSS
  const fontFallbackCSS = `
    /* Font fallback CSS for build issues */
    @font-face {
      font-family: 'Geist Fallback';
      src: local('system-ui'), local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Geist Mono Fallback';
      src: local('ui-monospace'), local('SFMono-Regular'), local('Menlo'), local('Monaco'), local('Consolas'), local('Liberation Mono'), local('Courier New'), local('monospace');
      font-display: swap;
    }
  `;

  // Write fallback CSS to public directory
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicDir, 'font-fallback.css'), fontFallbackCSS);
  
  console.log('Font fallback CSS created successfully');
  
  // Run the build
  console.log('Running Next.js build...');
  execSync('next build --turbopack', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
