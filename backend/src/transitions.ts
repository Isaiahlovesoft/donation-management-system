import type { DonationStatus } from "./types.js";

/**
 * Allowed status transitions (excluding no-op “same status”).
 *
 * Pipeline: new → pending → success | failure
 * Terminal states success/failure cannot change again.
 */
const ALLOWED: Record<DonationStatus, DonationStatus[]> = {
  new: ["pending"],
  pending: ["success", "failure"],
  success: [],
  failure: [],
};

/** `from === to` is always allowed (no-op); otherwise `to` must be listed under `from`. */
export function isValidTransition(from: DonationStatus, to: DonationStatus): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

/** Human-readable reason for 422 when a transition is rejected. */
export function transitionErrorMessage(from: DonationStatus, to: DonationStatus): string {
  if (from === to) return "";
  const next = ALLOWED[from];
  if (next.length === 0) {
    return `Donation is terminal (${from}). No further status changes are allowed.`;
  }
  return `Invalid status transition: cannot move from "${from}" to "${to}". Allowed next states: ${next.map((s) => `"${s}"`).join(", ")}.`;
}
