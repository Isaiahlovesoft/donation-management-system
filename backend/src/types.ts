/**
 * Shared donation domain types (aligned with a typical donation-processor payload).
 *
 * - `amount` is stored in integer cents (e.g. 5000 = $50.00).
 * - `currency` is fixed to USD in this demo.
 * - Status follows a small state machine; see `transitions.ts`.
 */

/** How the donor paid — used for reporting and validation. */
export type PaymentMethod = "cc" | "ach" | "crypto" | "venmo";

/** Lifecycle: new → pending → success | failure (see allowed edges in `transitions.ts`). */
export type DonationStatus = "new" | "pending" | "success" | "failure";

/** Full record as persisted and returned by the API (`updatedAt` maintained by the server). */
export interface Donation {
  uuid: string;
  amount: number;
  currency: "USD";
  paymentMethod: PaymentMethod;
  nonprofitId: string;
  donorId: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST /donations — same fields as Donation except no `updatedAt` (server sets it). */
export interface CreateDonationBody {
  uuid: string;
  amount: number;
  currency: "USD";
  paymentMethod: PaymentMethod;
  nonprofitId: string;
  donorId: string;
  status: DonationStatus;
  createdAt: string;
}

/** Body for PATCH /donations/:uuid/status — only the next status is sent. */
export interface PatchStatusBody {
  status: DonationStatus;
}
