"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmModal from "@/components/admin-confirm-modal";

type Props = {
  noteId: string;
  label: string;
};

export default function AdminDeleteUserNoteButton({ noteId, label }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function removeConfirmed() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/user-notes/${noteId}`, {
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        title="Smazat poznámku"
        aria-label="Smazat poznámku"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
        title="Smazat poznámku"
        description={`Opravdu chcete odstranit tuto poznámku?\n\n"${label}"`}
        confirmLabel="Ano, smazat"
        danger
        onConfirm={removeConfirmed}
        onCancel={() => !loading && setOpen(false)}
        loading={loading}
      />
    </>
  );
}