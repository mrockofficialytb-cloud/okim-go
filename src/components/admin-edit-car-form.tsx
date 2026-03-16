"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  car: {
    id: string;
    brand: string;
    model: string;
    slug: string;
    imageUrl?: string | null;
  };
};

export default function AdminEditCarForm({ car }: Props) {
  const router = useRouter();

  const [brand, setBrand] = useState(car.brand);
  const [model, setModel] = useState(car.model);
  const [slug, setSlug] = useState(car.slug);
  const [imageUrl, setImageUrl] = useState(car.imageUrl ?? "");

  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);

    const res = await fetch(`/api/admin/cars/${car.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand,
        model,
        slug,
        imageUrl,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Uložení se nepodařilo");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <input
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Značka"
        className="admin-input"
      />

      <input
        value={model}
        onChange={(e) => setModel(e.target.value)}
        placeholder="Model"
        className="admin-input"
      />

      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="Slug"
        className="admin-input"
      />

      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="URL obrázku"
        className="admin-input"
      />

      <div className="flex gap-3">
        <button
          onClick={save}
          className="admin-btn-dark"
          disabled={loading}
        >
          {loading ? "Ukládám..." : "Uložit"}
        </button>
      </div>
    </div>
  );
}