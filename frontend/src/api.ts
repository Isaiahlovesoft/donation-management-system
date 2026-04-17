import type { Donation, DonationStatus } from "./types";

async function readError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    if (j.error && typeof j.error === "string") return j.error;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status}).`;
}

export async function fetchDonations(): Promise<Donation[]> {
  const res = await fetch("/donations");
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { donations: Donation[] };
  return data.donations;
}

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
