import type { CreateDonationBody, Donation } from "./types.js";

/** Fields that must match for POST /donations to be considered the same idempotent request. */
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
