"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  carId: string;
  active: boolean;
  image?: string | null;
};

export default function AdminCarImageForm({ carId, active, image }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(image ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function save() {
    try {
      setLoading(true);
      setSuccess("");
      setError("");

      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active,
          image: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Uložení obrázku se nepodařilo.");
        return;
      }

      setSuccess("Obrázek uložen.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při ukládání.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
      <div className="mb-3 text-sm font-semibold text-neutral-800">Obrázek modelu</div>

      <div className="flex flex-col gap-3">
        <input
          placeholder="URL obrázku"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
        />

        {value && (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3">
            <img
              src={value}
              alt="Náhled obrázku"
              className="h-40 w-full rounded-xl object-cover"
            />
          </div>
        )}
      </div>

      {(success || error) && (
        <div className="mt-4">
          {success && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Ukládám..." : "Uložit obrázek"}
        </button>
      </div>
    </div>
  );
}