"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmModal from "@/components/admin-confirm-modal";

type Props = {
  variantId: string;
  variantName: string;
  modelName: string;
};

export default function AdminDeleteVariantButton({
  variantId,
  variantName,
  modelName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function removeConfirmed() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/car-variants/${variantId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.details
            ? `${data.error} (${data.details})`
            : data?.error ?? "Smazání varianty se nepodařilo."
        );
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Došlo k chybě při mazání varianty."
      );
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
          {loading ? "Mažu..." : "Smazat variantu"}
        </button>

        {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
      </div>

      <AdminConfirmModal
        open={open}
        title="Smazat variantu"
        description={
  <>
    Opravdu chcete odstranit variantu{" "}
    <strong className="font-semibold text-neutral-900">{variantName}</strong>{" "}
    u modelu{" "}
    <strong className="font-semibold text-neutral-900">{modelName}</strong>? 
    Tato akce je nevratná.
  </>
}
        confirmLabel="Ano, smazat"
        danger
        onConfirm={removeConfirmed}
        onCancel={() => !loading && setOpen(false)}
        loading={loading}
      />
    </>
  );
}