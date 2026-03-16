"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmModal from "@/components/admin-confirm-modal";

type Props = {
  userId: string;
  userName: string;
};

export default function AdminDeleteUserButton({ userId, userName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Smazání uživatele se nepodařilo.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Došlo k chybě při mazání uživatele.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 opacity-0 transition hover:bg-red-50 group-hover:opacity-100"
        title="Smazat uživatele"
        aria-label={`Smazat uživatele ${userName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>

      <AdminConfirmModal
        open={open}
        title="Odstranit uživatele"
        description={`Opravdu chcete odstranit uživatele "${userName}"?`}
        confirmLabel={loading ? "Mažu..." : "Ano, odstranit"}
        danger
        onConfirm={handleDelete}
        onCancel={() => {
          if (!loading) {
            setOpen(false);
            setError("");
          }
        }}
      />

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </>
  );
}