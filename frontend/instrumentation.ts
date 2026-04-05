/**
 * Instrumentation file for Next.js
 * This runs before the server starts and is used to polyfill global variables
 */

export async function register() {
  // Polyfill for 'self' in server environment
  // This fixes "ReferenceError: self is not defined" errors from libraries like recharts
  if (typeof self === 'undefined') {
    // @ts-expect-error - global polyfill
    globalThis.self = globalThis;
  }
}
