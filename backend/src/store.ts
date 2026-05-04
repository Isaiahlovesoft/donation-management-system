/**
 * In-memory donation persistence for the demo API.
 *
 * - Backed by a `Map` keyed by donation `uuid`.
 * - `getByUuid` / `getAll` return shallow copies so callers cannot mutate internal state.
 * - Module load runs `loadSeed()` once so the server always starts with demo data.
 */
import type { Donation } from "./types.js";
import { donationsWithTimestamps } from "./seed.js";

const donations = new Map<string, Donation>();

/** Replace all rows with seed fixtures (used at startup and if you extend with a “reset” route). */
export function loadSeed(): void {
  donations.clear();
  for (const d of donationsWithTimestamps()) {
    donations.set(d.uuid, { ...d });
  }
}

/** All donations, oldest-first by `createdAt` (stable ordering for the dashboard). */
export function getAll(): Donation[] {
  return [...donations.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/** Lookup by primary key; returns a copy or `undefined`. */
export function getByUuid(uuid: string): Donation | undefined {
  const d = donations.get(uuid);
  return d ? { ...d } : undefined;
}

/** Insert or replace a full donation record (POST create path). */
export function upsertDonation(donation: Donation): void {
  donations.set(donation.uuid, { ...donation });
}

/** Apply a functional update in place; returns false if `uuid` is unknown. */
export function updateDonation(uuid: string, updater: (d: Donation) => Donation): boolean {
  const current = donations.get(uuid);
  if (!current) return false;
  donations.set(uuid, updater({ ...current }));
  return true;
}

loadSeed();
