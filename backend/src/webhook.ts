//optional webhook simulation when a donation settles

import type { Donation } from "./types.js";

export type SettlementEvent = "donation.success" | "donation.failure";

export function emitSettlementWebhook(donation: Donation, kind: SettlementEvent): void {
  const payload = {
    type: kind,
    uuid: donation.uuid,
    amount: donation.amount,
    currency: donation.currency,
    nonprofitId: donation.nonprofitId,
    donorId: donation.donorId,
    at: donation.updatedAt,
  };
  // In production this would POST to a subscriber URL; here we log for operators.
  console.log("[webhook]", JSON.stringify(payload));
}
