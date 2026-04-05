#!/usr/bin/env node

/**
 * Custom build script to fix "self is not defined" error
 * This patches the global environment before running Next.js build
 */

// Poly fill for 'self' in Node.js environment
if (typeof self === 'undefined') {
  global.self = global;
}

// Import and run the Next.js build
const { build } = require('next/dist/build');
const path = require('path');

const dir = path.join(__dirname, '..');

console.log('Starting custom build with polyfills...');

build(dir, null, false, false, true)
  .then(() => {
    console.log('Build completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
