/**
 * Donation HTTP API — create, list, fetch by id, and patch status.
 *
 * Routes (all prefixed by app mounting, e.g. `/donations`):
 * - POST   /           Create donation (uuid idempotency via body fingerprint)
 * - GET    /           List all
 * - GET    /:uuid     Single donation
 * - PATCH  /:uuid/status  Update status (state machine + optional Idempotency-Key replay)
 */
import { Router } from "express";
import type { Donation } from "../types.js";
import { createBodyFingerprint, donationFingerprint } from "../idempotency.js";
import { parseCreateBody, parsePatchStatus } from "../validation.js";
import { getAll, getByUuid, upsertDonation, updateDonation } from "../store.js";
import { isValidTransition, transitionErrorMessage } from "../transitions.js";
import { emitSettlementWebhook } from "../webhook.js";

export const donationsRouter = Router();

/**
 * PATCH idempotency cache: for each (donation uuid + Idempotency-Key), remember
 * the serialized body → last JSON response. Replaying the exact same PATCH returns
 * the cached response; reusing the key with a different body returns 409.
 */
const patchIdempotentReplay = new Map<string, Map<string, { donation: Donation }>>();

function patchCacheKey(uuid: string, idem: string): string {
  return `${uuid}\0${idem}`;
}

donationsRouter.post("/", (req, res) => {
  const parsed = parseCreateBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.message });
    return;
  }
  const body = parsed.value;
  const existing = getByUuid(body.uuid);
  if (existing) {
    // Same uuid + same payload → safe retry (200). Different payload → conflict (409).
    if (donationFingerprint(existing) === createBodyFingerprint(body)) {
      res.status(200).json({ donation: existing });
      return;
    }
    res.status(409).json({
      error: "Idempotency conflict: a donation with this uuid already exists with different data.",
    });
    return;
  }

  const now = new Date().toISOString();
  const donation: Donation = {
    ...body,
    updatedAt: now,
  };
  upsertDonation(donation);
  res.status(201).json({ donation });
});

donationsRouter.get("/", (_req, res) => {
  res.json({ donations: getAll() });
});

donationsRouter.get("/:uuid", (req, res) => {
  const d = getByUuid(req.params.uuid);
  if (!d) {
    res.status(404).json({ error: "Donation not found." });
    return;
  }
  res.json({ donation: d });
});

donationsRouter.patch("/:uuid/status", (req, res) => {
  const parsed = parsePatchStatus(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.message });
    return;
  }
  const { status: nextStatus } = parsed;
  const uuid = req.params.uuid;
  const bodySignature = JSON.stringify({ status: nextStatus });
  const idem = req.header("Idempotency-Key");

  if (idem) {
    const outer = patchIdempotentReplay.get(patchCacheKey(uuid, idem));
    if (outer) {
      const hit = outer.get(bodySignature);
      if (hit) {
        res.json(hit);
        return;
      }
      // Key was used for this uuid before, but with a different body — do not apply twice.
      if (outer.size > 0) {
        res.status(409).json({
          error: "Idempotency conflict: this Idempotency-Key was already used with a different request body.",
        });
        return;
      }
    }
  }

  const current = getByUuid(uuid);
  if (!current) {
    res.status(404).json({ error: "Donation not found." });
    return;
  }

  if (current.status !== nextStatus && !isValidTransition(current.status, nextStatus)) {
    res.status(422).json({ error: transitionErrorMessage(current.status, nextStatus) });
    return;
  }

  let donation: Donation;
  if (current.status === nextStatus) {
    // Idempotent PATCH to current status — no store write, no webhook.
    donation = current;
  } else {
    const updatedAt = new Date().toISOString();
    updateDonation(uuid, (d) => ({
      ...d,
      status: nextStatus,
      updatedAt,
    }));
    donation = getByUuid(uuid)!;
    if (nextStatus === "success") emitSettlementWebhook(donation, "donation.success");
    if (nextStatus === "failure") emitSettlementWebhook(donation, "donation.failure");
  }

  const payload = { donation };
  if (idem) {
    const k = patchCacheKey(uuid, idem);
    let inner = patchIdempotentReplay.get(k);
    if (!inner) {
      inner = new Map();
      patchIdempotentReplay.set(k, inner);
    }
    inner.set(bodySignature, payload);
  }

  res.json(payload);
});
