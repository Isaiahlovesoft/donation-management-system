import type { DonationStatus } from "./types";

/** Next statuses the operator may set (excludes no-op). */
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
