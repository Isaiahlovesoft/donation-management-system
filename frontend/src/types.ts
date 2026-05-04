/**
 * Client-side donation shape — kept in sync with `backend/src/types.ts` Donation.
 * Duplicated here so the Vite app type-checks without importing server-only modules.
 */

export type PaymentMethod = "cc" | "ach" | "crypto" | "venmo";

export type DonationStatus = "new" | "pending" | "success" | "failure";

export interface Donation {
  uuid: string;
  /** Amount in integer cents (API contract). */
  amount: number;
  currency: "USD";
  paymentMethod: PaymentMethod;
  nonprofitId: string;
  donorId: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
}
