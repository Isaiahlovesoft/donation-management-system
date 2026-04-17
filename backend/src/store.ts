import type { Donation } from "./types.js";
import { donationsWithTimestamps } from "./seed.js";

const donations = new Map<string, Donation>();

export function loadSeed(): void {
  donations.clear();
  for (const d of donationsWithTimestamps()) {
    donations.set(d.uuid, { ...d });
  }
}

export function getAll(): Donation[] {
  return [...donations.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function getByUuid(uuid: string): Donation | undefined {
  const d = donations.get(uuid);
  return d ? { ...d } : undefined;
}

export function upsertDonation(donation: Donation): void {
  donations.set(donation.uuid, { ...donation });
}

/** @returns false if uuid did not exist */
export function updateDonation(uuid: string, updater: (d: Donation) => Donation): boolean {
  const current = donations.get(uuid);
  if (!current) return false;
  donations.set(uuid, updater({ ...current }));
  return true;
}

loadSeed();
