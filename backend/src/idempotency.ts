import type { CreateDonationBody, Donation } from "./types.js";

/**
 * Stable JSON fingerprint of a create payload.
 * Used so a duplicate POST with the same `uuid` can return 200 if the body matches,
 * or 409 if the same `uuid` was used with different data (idempotency conflict).
 */
export function createBodyFingerprint(body: CreateDonationBody): string {
  return JSON.stringify({
    uuid: body.uuid,
    amount: body.amount,
    currency: body.currency,
    paymentMethod: body.paymentMethod,
    nonprofitId: body.nonprofitId,
    donorId: body.donorId,
    status: body.status,
    createdAt: body.createdAt,
  });
}

/** Same canonical field order as `createBodyFingerprint` so stored vs incoming bodies compare cleanly. */
export function donationFingerprint(d: Donation): string {
  return JSON.stringify({
    uuid: d.uuid,
    amount: d.amount,
    currency: d.currency,
    paymentMethod: d.paymentMethod,
    nonprofitId: d.nonprofitId,
    donorId: d.donorId,
    status: d.status,
    createdAt: d.createdAt,
  });
}
