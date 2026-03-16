"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminReservationHandoverModal from "@/components/admin-reservation-handover-modal";

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

export default function AdminReservationActions({
  reservationId,
  status,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  async function updateStatus(newStatus: ReservationStatus) {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Změna stavu se nepodařila.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function submitHandover(
    type: "pickup" | "return",
    data: {
      mileage: number;
      fuel: string;
      note: string;
      signatureOwner?: string;
      signatureCustomer?: string;
    }
  ) {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/handover`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          mileage: data.mileage,
          fuel: data.fuel,
          note: data.note,
          signatureOwner: data.signatureOwner,
          signatureCustomer: data.signatureCustomer,
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        alert(responseData?.error || "Uložení předání/vrácení se nepodařilo.");
        return;
      }

      setPickupOpen(false);
      setReturnOpen(false);
      router.refresh();
    } catch (error) {
      console.error("SUBMIT_HANDOVER_ERROR", error);
      alert("Došlo k chybě při odeslání.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" && (
          <>
            <button
              type="button"
              onClick={() => updateStatus("CONFIRMED")}
              disabled={loading}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              Schválit
            </button>

            <button
              type="button"
              onClick={() => updateStatus("CANCELED")}
              disabled={loading}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              Zrušit
            </button>
          </>
        )}

        {status === "CONFIRMED" && (
          <>
            <button
              type="button"
              onClick={() => setPickupOpen(true)}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Podepsat předání
            </button>

            <button
              type="button"
              onClick={() => updateStatus("CANCELED")}
              disabled={loading}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              Zrušit
            </button>
          </>
        )}

        {status === "PICKED_UP" && (
          <button
            type="button"
            onClick={() => setReturnOpen(true)}
            disabled={loading}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            Označit jako vráceno
          </button>
        )}

        {status === "RETURNED" && (
          <div className="text-sm font-medium text-emerald-600">
            ✓ Rezervace dokončena
          </div>
        )}

        {status === "CANCELED" && (
          <div className="text-sm font-medium text-red-600">
            ✕ Rezervace zrušena
          </div>
        )}
      </div>

      <AdminReservationHandoverModal
        open={pickupOpen}
        mode="pickup"
        loading={loading}
        onClose={() => setPickupOpen(false)}
        onSubmit={(data) => submitHandover("pickup", data)}
      />

      <AdminReservationHandoverModal
        open={returnOpen}
        mode="return"
        loading={loading}
        onClose={() => setReturnOpen(false)}
        onSubmit={(data) => submitHandover("return", data)}
      />
    </>
  );
}