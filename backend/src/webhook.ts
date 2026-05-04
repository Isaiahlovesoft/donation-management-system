/**
 * Simulated outbound webhook when a donation reaches a terminal settlement status.
 *
 * In production you would POST `payload` to a subscriber URL with signing/retries.
 * Here we only log JSON so operators can see the event in the server console.
 */
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
  console.log("[webhook]", JSON.stringify(payload));
}
