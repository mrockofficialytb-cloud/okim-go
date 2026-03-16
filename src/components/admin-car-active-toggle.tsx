"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmModal from "@/components/admin-confirm-modal";

type Props = {
  carId: string;
  carName: string;
  active: boolean;
};

export default function AdminCarActiveToggle({
  carId,
  carName,
  active,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function toggleConfirmed() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Změnu se nepodařilo uložit.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Došlo k chybě při ukládání.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-3">
          <span className={active ? "admin-badge-success" : "admin-badge-danger"}>
            {active ? "Aktivní" : "Neaktivní"}
          </span>

          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={loading}
            className="admin-btn-outline disabled:opacity-60"
          >
            {active ? "Deaktivovat model" : "Aktivovat model"}
          </button>
        </div>

        {error && <div className="text-sm font-medium text-red-700">{error}</div>}
      </div>

      <AdminConfirmModal
        open={open}
        title={active ? "Deaktivovat model" : "Aktivovat model"}
        description={
          active
            ? `Opravdu chcete deaktivovat vůz "${carName}"?`
            : `Opravdu chcete aktivovat vůz "${carName}"?`
        }
        confirmLabel={active ? "Ano, deaktivovat" : "Ano, aktivovat"}
        onConfirm={toggleConfirmed}
        onCancel={() => !loading && setOpen(false)}
        loading={loading}
      />
    </>
  );
}