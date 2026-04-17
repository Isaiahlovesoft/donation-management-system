import type { DonationStatus } from "./types.js";

/** Valid single-step transitions (excluding no-op same status). */
const ALLOWED: Record<DonationStatus, DonationStatus[]> = {
  new: ["pending"],
  pending: ["success", "failure"],
  success: [],
  failure: [],
};

export function isValidTransition(from: DonationStatus, to: DonationStatus): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function transitionErrorMessage(from: DonationStatus, to: DonationStatus): string {
  if (from === to) return "";
  const next = ALLOWED[from];
  if (next.length === 0) {
    return `Donation is terminal (${from}). No further status changes are allowed.`;
  }
  return `Invalid status transition: cannot move from "${from}" to "${to}". Allowed next states: ${next.map((s) => `"${s}"`).join(", ")}.`;
}
