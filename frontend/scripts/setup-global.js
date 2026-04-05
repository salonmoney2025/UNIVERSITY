/**
 * Global polyfills for Next.js build
 * This file is loaded before the build starts to patch global variables
 */

// Polyfill for 'self' in Node.js environment
// We use a Proxy to make it behave like the browser's self object
if (typeof self === 'undefined') {
  global.self = new Proxy(global, {
    get(target, prop) {
      if (prop === 'self') return global.self;
      if (prop in target) return target[prop];
      return undefined;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
  console.log('✓ Polyfilled global.self for server environment');
}
