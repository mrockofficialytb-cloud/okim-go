"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmModal from "@/components/admin-confirm-modal";

type Props = {
  carId: string;
  carName: string;
};

export default function AdminDeleteCarButton({ carId, carName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function removeConfirmed() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/cars/${carId}/delete`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Smazání modelu se nepodařilo.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Došlo k chybě při mazání modelu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={loading}
          className="admin-btn-danger disabled:opacity-60"
        >
          {loading ? "Mažu..." : "Smazat model"}
        </button>

        {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
      </div>

      <AdminConfirmModal
        open={open}
        title="Smazat model"
        description={`Opravdu chcete odstranit vůz "${carName}"? Tato akce je nevratná.`}
        confirmLabel="Ano, smazat"
        danger
        onConfirm={removeConfirmed}
        onCancel={() => !loading && setOpen(false)}
        loading={loading}
      />
    </>
  );
}