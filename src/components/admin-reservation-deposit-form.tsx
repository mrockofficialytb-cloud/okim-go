"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DepositStatus = "UNPAID" | "PAID" | "RETURNED";

type Props = {
  reservationId: string;
  initialAmount?: number | null;
  initialStatus?: DepositStatus | null;
};

export default function AdminReservationDepositForm({
  reservationId,
  initialAmount,
  initialStatus,
}: Props) {
  const router = useRouter();

  const [depositAmount, setDepositAmount] = useState(
    initialAmount != null ? String(initialAmount) : ""
  );
  const [depositStatus, setDepositStatus] = useState<DepositStatus>(
    initialStatus ?? "UNPAID"
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    try {
      setLoading(true);
      setSuccess("");
      setError("");

      const res = await fetch(
        `/api/admin/reservations/${reservationId}/deposit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            depositAmount: Number(depositAmount || 0),
            depositStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Uložení kauce se nepodařilo.");
        return;
      }

      setSuccess("Kauce byla uložena.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při ukládání kauce.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-neutral-900">Kauce</h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Výše kauce (Kč)</label>
          <input
            type="number"
            min={0}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
            placeholder="Např. 10000"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Stav kauce</label>
          <select
            value={depositStatus}
            onChange={(e) => setDepositStatus(e.target.value as DepositStatus)}
            className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          >
            <option value="UNPAID">Nezaplacena</option>
            <option value="PAID">Zaplacena</option>
            <option value="RETURNED">Vrácena</option>
          </select>
        </div>
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

      <div className="mt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="h-11 rounded-2xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? "Ukládám..." : "Uložit kauci"}
        </button>
      </div>
    </div>
  );
}