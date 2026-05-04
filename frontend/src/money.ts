/**
 * Display helpers — API stores money as integer cents; UI shows USD strings.
 */

/** Formats integer cents as a locale-aware USD currency string (e.g. 499 → "$4.99"). */
export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
