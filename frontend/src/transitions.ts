import type { DonationStatus } from "./types";

/**
 * Which status buttons to show in the UI — mirrors server `transitions.ts` / `isValidTransition`.
 * Terminal states return [] so the operator sees "—" instead of invalid actions.
 */
export function allowedNextStatuses(current: DonationStatus): DonationStatus[] {
  switch (current) {
    case "new":
      return ["pending"];
    case "pending":
      return ["success", "failure"];
    case "success":
    case "failure":
      return [];
    default:
      return [];
  }
}
