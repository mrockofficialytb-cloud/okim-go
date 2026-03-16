"use client";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Potvrdit",
  cancelLabel = "Zrušit",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="admin-btn-outline flex-1 disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-2xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-neutral-900 hover:bg-neutral-800"
            }`}
          >
            {loading ? "Provádím..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}