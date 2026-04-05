/**
 * API Routes Layout
 * Forces all API routes to be dynamically rendered
 */

export const dynamic = 'force-dynamic';

export default function APILayout({ children }: { children: React.ReactNode }) {
  return children;
}
