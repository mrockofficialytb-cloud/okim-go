"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmModal from "@/components/admin-confirm-modal";

type Props = {
  blockedPeriodId: string;
  label: string;
};

export default function AdminDeleteBlockedPeriodButton({
  blockedPeriodId,
  label,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function removeConfirmed() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/blocked-periods/${blockedPeriodId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="rounded-xl border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? "Mažu..." : "Smazat"}
      </button>

      <AdminConfirmModal
        open={open}
        title="Smazat blokaci"
        description={`Opravdu chcete odstranit blokaci "${label}"?`}
        confirmLabel="Ano, smazat"
        danger
        onConfirm={removeConfirmed}
        onCancel={() => !loading && setOpen(false)}
        loading={loading}
      />
    </>
  );
}