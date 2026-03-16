"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateCarForm() {
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin/cars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ brand, model, slug }),
    });

    setLoading(false);
    setBrand("");
    setModel("");
    setSlug("");

    router.refresh();
  }

  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">

        <input
          placeholder="Značka"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
          className="rounded-xl border px-3 py-2"
        />

        <input
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
          className="rounded-xl border px-3 py-2"
        />

        <input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="rounded-xl border px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#171717] px-5 py-2 text-white hover:bg-neutral-800"
        >
          {loading ? "Ukládám..." : "Uložit"}
        </button>

      </form>

    </div>
  );
}