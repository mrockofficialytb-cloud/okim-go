"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminDeleteUserNoteButton from "@/components/admin-delete-user-note-button";

type NoteItem = {
  id: string;
  note: string;
  createdAt: string | Date;
};

type Props = {
  userId: string;
  notes: NoteItem[];
};

export default function AdminUserNoteForm({ userId, notes }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function save() {
    if (!value.trim()) {
      setError("Zadej text poznámky.");
      return;
    }

    try {
      setLoading(true);
      setSuccess("");
      setError("");

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Uložení poznámky se nepodařilo.");
        return;
      }

      setValue("");
      setSuccess("Poznámka byla přidána.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při ukládání poznámky.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Interní poznámka zákazníka
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Interní historie poznámek viditelná pouze administrátorům.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder="Např. znečištěný interiér, pozdní vrácení, problém při předání, VIP klient..."
          className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900"
        />
      </div>

      {(success || error) && (
        <div className="mt-4">
          {success && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="admin-btn-dark disabled:opacity-60"
        >
          {loading ? "Ukládám..." : "Přidat poznámku"}
        </button>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-neutral-900">
          Historie poznámek
        </div>

        <div className="space-y-3">
          {notes.length === 0 && (
            <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
              Žádné poznámky.
            </div>
          )}

          {notes.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {new Date(item.createdAt).toLocaleString("cs-CZ")}
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-neutral-800">
                    {item.note}
                  </div>
                </div>

                <AdminDeleteUserNoteButton
                  noteId={item.id}
                  label={item.note.length > 120 ? `${item.note.slice(0, 120)}…` : item.note}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}