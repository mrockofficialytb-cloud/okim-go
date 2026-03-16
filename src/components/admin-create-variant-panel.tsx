"use client";

import AdminCreateVariantForm from "@/components/admin-create-variant-form";

type Props = {
  carModelId: string;
  onClose: () => void;
};

export default function AdminCreateVariantPanel({ carModelId, onClose }: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-900">
          Nová varianta
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          Zavřít
        </button>
      </div>

      <AdminCreateVariantForm carModelId={carModelId} />
    </div>
  );
}