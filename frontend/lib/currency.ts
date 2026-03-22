/**
 * Currency Configuration for Sierra Leone Leone (SLL)
 */

export const CURRENCY = {
  code: 'SLL',
  symbol: 'NSL',
  name: 'Sierra Leone Leone',
  locale: 'en-SL',
} as const;

/**
 * Format amount to Sierra Leone Leone currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat(CURRENCY.locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `${CURRENCY.symbol} ${formatted}` : formatted;
}

/**
 * Parse currency string to number
 * @param value - Currency string to parse
 * @returns Parsed number value
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @returns Formatted string with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(CURRENCY.locale).format(value);
}
