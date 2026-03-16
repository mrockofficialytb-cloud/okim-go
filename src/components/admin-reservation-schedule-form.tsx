"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  reservationId: string;
  initialPickupTimePlanned?: string | null;
  initialReturnTimePlanned?: string | null;
};

export default function AdminReservationScheduleForm({
  reservationId,
  initialPickupTimePlanned,
  initialReturnTimePlanned,
}: Props) {
  const router = useRouter();

  const [pickupTimePlanned, setPickupTimePlanned] = useState(
    initialPickupTimePlanned ?? ""
  );
  const [returnTimePlanned, setReturnTimePlanned] = useState(
    initialReturnTimePlanned ?? ""
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
        `/api/admin/reservations/${reservationId}/schedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pickupTimePlanned: pickupTimePlanned || null,
            returnTimePlanned: returnTimePlanned || null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Uložení časů se nepodařilo.");
        return;
      }

      setSuccess("Plánované časy byly uloženy.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při ukládání časů.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-neutral-900">
        Plánované časy
      </h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Čas vyzvednutí
          </label>
          <input
            type="time"
            value={pickupTimePlanned}
            onChange={(e) => setPickupTimePlanned(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Čas vrácení
          </label>
          <input
            type="time"
            value={returnTimePlanned}
            onChange={(e) => setReturnTimePlanned(e.target.value)}
            className="h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
          />
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
          {loading ? "Ukládám..." : "Uložit časy"}
        </button>
      </div>
    </div>
  );
}