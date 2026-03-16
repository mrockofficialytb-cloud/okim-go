"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELED";

type Props = {
  reservationId: string;
  status: ReservationStatus;
};

export default function MyReservationCancelButton({
  reservationId,
  status,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const canCancel = status === "PENDING" || status === "CONFIRMED";

  if (!canCancel) {
    return null;
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      "Opravdu chcete tuto rezervaci zrušit?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/moje-rezervace/${reservationId}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Zrušení rezervace se nepodařilo.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("MY_RESERVATION_CANCEL_ERROR", error);
      alert("Došlo k chybě při zrušení rezervace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
    >
      {loading ? "Ruším..." : "Zrušit rezervaci"}
    </button>
  );
}