/**
 * Donation processor dashboard — lists seed/API donations, filters, summary stats,
 * and per-row actions that PATCH allowed next statuses.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Donation, DonationStatus, PaymentMethod } from "./types";
import { fetchDonations, patchDonationStatus } from "./api";
import { formatUsdFromCents } from "./money";
import { allowedNextStatuses } from "./transitions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: DonationStatus[] = ["new", "pending", "success", "failure"];
const METHOD_OPTIONS: PaymentMethod[] = ["cc", "ach", "crypto", "venmo"];

function statusLabel(s: DonationStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Colored badge variants keyed by lifecycle state (success green, pending amber, etc.). */
function StatusBadge({ status }: { status: DonationStatus }) {
  return (
    <Badge
      variant={status === "failure" ? "destructive" : "outline"}
      className={cn(
        status === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
        status === "new" &&
          "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100",
        status === "pending" &&
          "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
      )}
    >
      {status}
    </Badge>
  );
}

export default function App() {
  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  /** When set, that row's action buttons disable to prevent double-submit. */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<DonationStatus | "all">("all");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchDonations();
      setRows(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Table rows after client-side status/method filters (does not re-fetch). */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterMethod !== "all" && r.paymentMethod !== filterMethod) return false;
      return true;
    });
  }, [rows, filterStatus, filterMethod]);

  /** Aggregate counts and volume for the summary card above the table. */
  const summary = useMemo(() => {
    const byMethod: Record<PaymentMethod, { count: number; cents: number }> = {
      cc: { count: 0, cents: 0 },
      ach: { count: 0, cents: 0 },
      crypto: { count: 0, cents: 0 },
      venmo: { count: 0, cents: 0 },
    };
    let success = 0;
    let failure = 0;
    let pending = 0;
    let fresh = 0;
    for (const r of rows) {
      byMethod[r.paymentMethod].count += 1;
      byMethod[r.paymentMethod].cents += r.amount;
      if (r.status === "success") success += 1;
      else if (r.status === "failure") failure += 1;
      else if (r.status === "pending") pending += 1;
      else fresh += 1;
    }
    const settled = success + failure;
    const rate = settled === 0 ? null : Math.round((success / settled) * 100);
    return { byMethod, success, failure, pending, fresh, rate };
  }, [rows]);

  async function onTransition(uuid: string, next: DonationStatus) {
    setBusyId(uuid);
    try {
      const updated = await patchDonationStatus(uuid, next);
      setRows((prev) => prev.map((r) => (r.uuid === uuid ? updated : r)));
      toast.success(`Updated donation ${uuid.slice(0, 8)}… → ${next}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto min-h-svh max-w-6xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Donation processor</h1>
        <p className="text-sm text-muted-foreground">Internal dashboard — amounts in USD; API stores cents.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Counts and volume across loaded donations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Success / failure (settled)</p>
            <p className="text-lg font-semibold tabular-nums">
              {summary.success} / {summary.failure}
              {summary.rate !== null && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ({summary.rate}% success of settled)
                </span>
              )}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">In progress</p>
            <p className="text-lg font-semibold tabular-nums">
              {summary.fresh} new, {summary.pending} pending
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Volume by method</p>
            <ul className="space-y-1 text-sm">
              {METHOD_OPTIONS.map((m) => (
                <li key={m} className="flex justify-between gap-2 tabular-nums">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{m}</code>
                  <span>
                    {summary.byMethod[m].count} · {formatUsdFromCents(summary.byMethod[m].cents)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>Narrow the table by status or payment method.</CardDescription>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as DonationStatus | "all")}>
                <SelectTrigger id="filter-status" size="default" className="min-w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-method">Payment method</Label>
              <Select value={filterMethod} onValueChange={(v) => setFilterMethod(v as PaymentMethod | "all")}>
                <SelectTrigger id="filter-method" size="default" className="min-w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" size="default" disabled={loading} onClick={() => void load()}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nonprofit</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const next = allowedNextStatuses(r.status);
                  const disabled = busyId === r.uuid;
                  return (
                    <TableRow key={r.uuid}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.nonprofitId}</code>
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">{formatUsdFromCents(r.amount)}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.paymentMethod}</code>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground">{r.donorId}</code>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {next.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            next.map((s) => (
                              <Button
                                key={s}
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={disabled}
                                onClick={() => void onTransition(r.uuid, s)}
                              >
                                → {s}
                              </Button>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
