//data model per Every.org donation processor spec

export type PaymentMethod = "cc" | "ach" | "crypto" | "venmo";

export type DonationStatus = "new" | "pending" | "success" | "failure";

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

export interface PatchStatusBody {
  status: DonationStatus;
}
