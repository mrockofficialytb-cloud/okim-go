"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  variant: {
    id: string;
    name: string;
    transmission: string;
    fuel: string;
    seats: number;
    pricePerDayShort: number;
    pricePerDayLong: number;
    quantity: number;
    image?: string | null;
    active?: boolean;
  };
};

export default function AdminCarVariantForm({ variant }: Props) {
  const router = useRouter();

  const [name, setName] = useState(variant.name);
  const [transmission, setTransmission] = useState(variant.transmission);
  const [fuel, setFuel] = useState(variant.fuel);
  const [seats, setSeats] = useState(String(variant.seats));
  const [pricePerDayShort, setPricePerDayShort] = useState(
    String(variant.pricePerDayShort)
  );
  const [pricePerDayLong, setPricePerDayLong] = useState(
    String(variant.pricePerDayLong)
  );
  const [quantity, setQuantity] = useState(String(variant.quantity));
  const [image, setImage] = useState(variant.image ?? "");
  const [active, setActive] = useState(variant.active ?? true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function save() {
    try {
      setLoading(true);
      setSuccess("");
      setError("");

      const res = await fetch(`/api/admin/car-variants/${variant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        setError(data?.error ?? "Uložení se nepodařilo.");
        return;
      }

      setSuccess("Uloženo.");
      router.refresh();
    } catch {
      setError("Došlo k chybě při ukládání.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Název varianty</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Převodovka</label>
          <input
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Palivo</label>
          <input
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Počet míst</label>
          <input
            type="number"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Cena za den (1–7 dní)
          </label>
          <input
            type="number"
            value={pricePerDayShort}
            onChange={(e) => setPricePerDayShort(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Cena za den (8–30 dní)
          </label>
          <input
            type="number"
            value={pricePerDayLong}
            onChange={(e) => setPricePerDayLong(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Počet kusů</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div className="xl:col-span-2">
          <label className="mb-2 block text-sm font-medium">URL obrázku varianty</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/cars/multivan-long.jpg"
            className="h-11 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Varianta je aktivní
          </label>
        </div>
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
          {loading ? "Ukládám..." : "Uložit variantu"}
        </button>
      </div>
    </div>
  );
}