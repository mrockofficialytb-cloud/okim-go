"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  carVariantId: string;
};

export default function AdminBlockedPeriodForm({ carVariantId }: Props) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function save() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/admin/blocked-periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carVariantId,
          dateFrom: new Date(dateFrom).toISOString(),
          dateTo: new Date(dateTo).toISOString(),
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Blokaci se nepodařilo vytvořit.");
        return;
      }

      setDateFrom("");
      setDateTo("");
      setReason("");
      setSuccess("Blokace byla vytvořena.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při vytváření blokace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-5">
      <div className="mb-4 text-sm font-semibold text-neutral-800">Blokace termínu</div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />
        <input
          placeholder="Důvod blokace"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />
      </div>

      {(success || error) && (
        <div className="mt-4">
          {success && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Ukládám..." : "Přidat blokaci"}
        </button>
      </div>
    </div>
  );
}