"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  carModelId: string;
};

export default function AdminCreateVariantForm({ carModelId }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");
  const [seats, setSeats] = useState("5");
  const [pricePerDayShort, setPricePerDayShort] = useState("0");
  const [pricePerDayLong, setPricePerDayLong] = useState("0");
  const [quantity, setQuantity] = useState("1");
  const [image, setImage] = useState("");
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function save() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/admin/car-variants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carModelId,
          name,
          transmission,
          fuel,
          seats: Number(seats),
          pricePerDayShort: Number(pricePerDayShort),
          pricePerDayLong: Number(pricePerDayLong),
          quantity: Number(quantity),
          image,
          active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Vytvoření varianty se nepodařilo.");
        return;
      }

      setName("");
      setTransmission("");
      setFuel("");
      setSeats("5");
      setPricePerDayShort("0");
      setPricePerDayLong("0");
      setQuantity("1");
      setImage("");
      setActive(true);
      setSuccess("Varianta byla vytvořena.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při vytváření varianty.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 text-sm font-semibold text-neutral-800">
        Nová varianta
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <input
          placeholder="Název varianty"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />

        <input
          placeholder="Převodovka"
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />

        <input
          placeholder="Palivo"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />

        <input
          type="number"
          placeholder="Počet míst"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />

        <input
          type="number"
          placeholder="Cena za den (1–7 dní)"
          value={pricePerDayShort}
          onChange={(e) => setPricePerDayShort(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />

        <input
          type="number"
          placeholder="Cena za den (8–30 dní)"
          value={pricePerDayLong}
          onChange={(e) => setPricePerDayLong(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />

        <input
          type="number"
          placeholder="Počet kusů"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="h-11 rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
        />

        <div className="xl:col-span-2">
          <input
            placeholder="URL obrázku varianty"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Varianta je aktivní
        </label>
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
          {loading ? "Vytvářím..." : "Přidat variantu"}
        </button>
      </div>
    </div>
  );
}