import type { CreateDonationBody, DonationStatus, PaymentMethod } from "./types.js";

const PAYMENT_METHODS: PaymentMethod[] = ["cc", "ach", "crypto", "venmo"];
const STATUSES: DonationStatus[] = ["new", "pending", "success", "failure"];

function isUuidShape(s: unknown): s is string {
  return typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export function parseCreateBody(
  body: unknown,
): { ok: true; value: CreateDonationBody } | { ok: false; message: string } {
  if (body === null || typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object." };
  }
  const o = body as Record<string, unknown>;

  if (!isUuidShape(o.uuid)) return { ok: false, message: "Field uuid must be a valid UUID string." };
  if (typeof o.amount !== "number" || !Number.isInteger(o.amount) || o.amount <= 0) {
    return { ok: false, message: "Field amount must be a positive integer (cents)." };
  }
  if (o.currency !== "USD") return { ok: false, message: 'Field currency must be "USD".' };
  if (typeof o.paymentMethod !== "string" || !PAYMENT_METHODS.includes(o.paymentMethod as PaymentMethod)) {
    return { ok: false, message: `Field paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}.` };
  }
  if (typeof o.nonprofitId !== "string" || o.nonprofitId.length === 0) {
    return { ok: false, message: "Field nonprofitId must be a non-empty string." };
  }
  if (typeof o.donorId !== "string" || o.donorId.length === 0) {
    return { ok: false, message: "Field donorId must be a non-empty string." };
  }
  if (typeof o.status !== "string" || !STATUSES.includes(o.status as DonationStatus)) {
    return { ok: false, message: `Field status must be one of: ${STATUSES.join(", ")}.` };
  }
  if (typeof o.createdAt !== "string" || Number.isNaN(Date.parse(o.createdAt))) {
    return { ok: false, message: "Field createdAt must be a valid ISO 8601 datetime string." };
  }

  return {
    ok: true,
    value: {
      uuid: o.uuid,
      amount: o.amount,
      currency: "USD",
      paymentMethod: o.paymentMethod as PaymentMethod,
      nonprofitId: o.nonprofitId,
      donorId: o.donorId,
      status: o.status as DonationStatus,
      createdAt: o.createdAt,
    },
  };
}

export function parsePatchStatus(body: unknown): { ok: true; status: DonationStatus } | { ok: false; message: string } {
  if (body === null || typeof body !== "object") {
    return { ok: false, message: "Request body must be a JSON object." };
  }
  const o = body as Record<string, unknown>;
  if (typeof o.status !== "string" || !STATUSES.includes(o.status as DonationStatus)) {
    return { ok: false, message: `Field status must be one of: ${STATUSES.join(", ")}.` };
  }
  return { ok: true, status: o.status as DonationStatus };
}
