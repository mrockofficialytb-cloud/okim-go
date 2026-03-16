"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCreateCarForm() {
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function save() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const finalSlug = slug || slugify(`${brand}-${model}`);

      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand,
          model,
          slug: finalSlug,
          image,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Vytvoření modelu se nepodařilo.");
        return;
      }

      setBrand("");
      setModel("");
      setSlug("");
      setImage("");
      setSuccess("Model byl vytvořen.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při vytváření modelu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="text-xl font-semibold">Nový model vozidla</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <input
          placeholder="Značka"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />
        <input
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />
        <input
          placeholder="Slug (volitelné)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />
        <input
          placeholder="URL obrázku (volitelné)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />
      </div>

      {(success || error) && (
        <div className="mt-4">
          {success && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Vytvářím..." : "Vytvořit model"}
        </button>
      </div>
    </div>
  );
}