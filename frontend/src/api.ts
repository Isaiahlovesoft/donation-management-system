/**
 * Typed fetch helpers for the donation API.
 *
 * Vite proxies `/donations` → backend (see `vite.config.ts`), so these use same-origin URLs.
 */
import type { Donation, DonationStatus } from "./types";

/** Parse `{ error: string }` from JSON error responses; fall back to a generic message. */
async function readError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    if (j.error && typeof j.error === "string") return j.error;
  } catch {
    /* non-JSON body */
  }
  return `Request failed (${res.status}).`;
}

/** GET /donations — full list for the dashboard. */
export async function fetchDonations(): Promise<Donation[]> {
  const res = await fetch("/donations");
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { donations: Donation[] };
  return data.donations;
}

/** PATCH /donations/:uuid/status — advances state machine on the server; returns updated row. */
export async function patchDonationStatus(uuid: string, status: DonationStatus): Promise<Donation> {
  const res = await fetch(`/donations/${encodeURIComponent(uuid)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { donation: Donation };
  return data.donation;
}
