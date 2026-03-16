"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmModal from "@/components/admin-confirm-modal";

type Props = {
  reservationId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED";
};

export default function MyReservationCancelButton({
  reservationId,
  status,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function cancelReservationConfirmed() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/my-reservations/${reservationId}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Rezervaci se nepodařilo zrušit.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Došlo k chybě při rušení rezervace.");
    } finally {
      setLoading(false);
    }
  }

  if (!["PENDING", "CONFIRMED"].includes(status)) {
    return null;
  }

  return (
    <>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={loading}
          className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          {loading ? "Ruším..." : "Zrušit rezervaci"}
        </button>

        {error && (
          <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <AdminConfirmModal
        open={open}
        title="Zrušit rezervaci"
        description="Opravdu chcete zrušit tuto rezervaci?"
        confirmLabel="Ano, zrušit"
        cancelLabel="Zpět"
        danger
        loading={loading}
        onConfirm={cancelReservationConfirmed}
        onCancel={() => !loading && setOpen(false)}
      />
    </>
  );
}