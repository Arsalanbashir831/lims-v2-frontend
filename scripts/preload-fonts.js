#!/usr/bin/env node

/**
 * Font preloading script for build-time font optimization
 * This script helps handle font loading issues during build
 */

const fs = require('fs');
const path = require('path');

// Create a font preload manifest
const fontManifest = {
  fonts: [
    {
      family: 'Geist',
      fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    {
      family: 'Geist Mono',
      fallback: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    }
  ]
};

// Write the manifest to a file that can be used during build
const manifestPath = path.join(__dirname, '..', 'public', 'font-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(fontManifest, null, 2));

console.log('Font manifest created successfully');
