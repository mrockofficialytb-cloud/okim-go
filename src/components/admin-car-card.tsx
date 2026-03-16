"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminCarVariantForm from "@/components/admin-car-variant-form";
import AdminCarActiveToggle from "@/components/admin-car-active-toggle";
import AdminCreateVariantPanel from "@/components/admin-create-variant-panel";
import AdminDeleteVariantButton from "@/components/admin-delete-variant-button";
import AdminDeleteCarButton from "@/components/admin-delete-car-button";
import AdminBlockedPeriodForm from "@/components/admin-blocked-period-form";
import AdminDeleteBlockedPeriodButton from "@/components/admin-delete-blocked-period-button";

type BlockedItem = {
  id: string;
  dateFrom: string;
  dateTo: string;
  reason?: string | null;
};

type VariantItem = {
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
  blocked: BlockedItem[];
};

type CarItem = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  active: boolean;
  variants: VariantItem[];
};

type Props = {
  car: CarItem;
};

export default function AdminCarCard({ car }: Props) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [brand, setBrand] = useState(car.brand);
  const [model, setModel] = useState(car.model);
  const [slug, setSlug] = useState(car.slug);
  const [saving, setSaving] = useState(false);
  const [openVariant, setOpenVariant] = useState<string | null>(null);
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function saveCar() {
    try {
      setSaving(true);
      setSaveError("");

      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: car.active,
          brand,
          model,
          slug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data?.error ?? "Uložení vozu se nepodařilo.");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch {
      setSaveError("Došlo k chybě při ukládání vozu.");
    } finally {
      setSaving(false);
    }
  }

  function resetEdit() {
    setBrand(car.brand);
    setModel(car.model);
    setSlug(car.slug);
    setSaveError("");
    setEditing(false);
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-4 flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          {!editing ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {car.brand}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900">
                {car.model}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">Slug: {car.slug}</p>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="admin-label">Značka</label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Model</label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>
          )}

          {editing && saveError && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {saveError}
            </div>
          )}
        </div>

        <div className="min-w-[280px] flex flex-col items-end gap-3">
          <AdminCarActiveToggle
            carId={car.id}
            carName={`${car.brand} ${car.model}`}
            active={car.active}
          />

          <AdminDeleteCarButton
            carId={car.id}
            carName={`${car.brand} ${car.model}`}
          />

          <div className="flex flex-wrap items-center justify-end gap-3">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
                Upravit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={saveCar}
                  disabled={saving}
                  className="admin-btn-dark disabled:opacity-60"
                >
                  {saving ? "Ukládám..." : "Uložit"}
                </button>

                <button
                  type="button"
                  onClick={resetEdit}
                  disabled={saving}
                  className="admin-btn-outline disabled:opacity-60"
                >
                  Zrušit
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-neutral-200 pt-6">
        <div className="mb-4 text-sm font-semibold text-neutral-900">
          Varianty
        </div>

        <div className="space-y-4">
          {car.variants.length === 0 && (
            <div className="rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
              Tento model zatím nemá žádné varianty.
            </div>
          )}

          {car.variants.map((variant) => {
            const isOpen = openVariant === variant.id;

            return (
              <div
                key={variant.id}
                className="rounded-3xl border border-neutral-200 bg-white p-5"
              >
                {!isOpen && (
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-neutral-900">
                        {variant.name}
                      </div>

                      <div className="mt-1 text-sm text-neutral-500">
                        {variant.transmission} • {variant.fuel} • {variant.seats} míst •{" "}
                        {variant.quantity} ks • {variant.active ? "Aktivní" : "Neaktivní"}
                      </div>

                      <div className="mt-2 text-sm text-neutral-700">
                        1–7 dní: <strong>{variant.pricePerDayShort} Kč</strong> • 8–30 dní:{" "}
                        <strong>{variant.pricePerDayLong} Kč</strong>
                      </div>

                      {variant.blocked.length > 0 && (
                        <div className="mt-2 text-xs text-neutral-500">
                          Aktivní blokace: {variant.blocked.length}
                        </div>
                      )}

                      {variant.image && (
                        <div className="mt-3">
                          <img
                            src={variant.image}
                            alt={variant.name}
                            className="h-24 w-40 rounded-xl border border-neutral-200 object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setOpenVariant(variant.id)}
                        className="admin-btn-outline"
                      >
                        Upravit variantu
                      </button>

                      <AdminDeleteVariantButton
                        variantId={variant.id}
                        variantName={variant.name}
						modelName={`${car.brand} ${car.model}`}
                      />
                    </div>
                  </div>
                )}

                {isOpen && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-neutral-900">
                        Upravit variantu
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenVariant(null)}
                        className="text-sm text-neutral-500 hover:text-neutral-800"
                      >
                        Zavřít
                      </button>
                    </div>

                    <AdminCarVariantForm
                      variant={{
                        id: variant.id,
                        name: variant.name,
                        transmission: variant.transmission,
                        fuel: variant.fuel,
                        seats: variant.seats,
                        pricePerDayShort: variant.pricePerDayShort,
                        pricePerDayLong: variant.pricePerDayLong,
                        quantity: variant.quantity,
                        image: variant.image,
                        active: variant.active,
                      }}
                    />

                    <AdminDeleteVariantButton
                      variantId={variant.id}
                      variantName={variant.name}
					  modelName={`${car.brand} ${car.model}`}
                    />

                    <AdminBlockedPeriodForm carVariantId={variant.id} />

                    <div className="mt-4">
                      <div className="mb-2 text-sm font-semibold text-neutral-900">
                        Aktivní blokace
                      </div>

                      <div className="space-y-2">
                        {variant.blocked.length === 0 && (
                          <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600">
                            Žádné blokace.
                          </div>
                        )}

                        {variant.blocked.map((block) => (
                          <div
                            key={block.id}
                            className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="text-sm text-neutral-700">
                              <strong>
                                {new Date(block.dateFrom).toLocaleDateString("cs-CZ")} –{" "}
                                {new Date(block.dateTo).toLocaleDateString("cs-CZ")}
                              </strong>
                              {block.reason ? ` • ${block.reason}` : ""}
                            </div>

                            <AdminDeleteBlockedPeriodButton
                              blockedPeriodId={block.id}
                              label={`${new Date(block.dateFrom).toLocaleDateString(
                                "cs-CZ"
                              )} – ${new Date(block.dateTo).toLocaleDateString("cs-CZ")}${
                                block.reason ? ` • ${block.reason}` : ""
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showCreateVariant && (
          <div className="mt-6">
            <AdminCreateVariantPanel
              carModelId={car.id}
              onClose={() => setShowCreateVariant(false)}
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowCreateVariant((prev) => !prev)}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            {showCreateVariant ? "Skrýt přidání varianty" : "+ Přidat variantu"}
          </button>
        </div>
      </div>
    </section>
  );
}