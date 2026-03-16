"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CarItem = {
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
  carModel: {
    id: string;
    slug: string;
    brand: string;
    model: string;
    image?: string | null;
    description?: string | null;
  };
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value) + " Kč";
}

function countDays(dateFrom: string, dateTo: string) {
  if (!dateFrom || !dateTo) return 0;

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  const diff = to.getTime() - from.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return days > 0 ? days : 0;
}

function getPricePerDay(car: CarItem, rentalDays: number) {
  return rentalDays >= 8 ? car.pricePerDayLong : car.pricePerDayShort;
}

function getTariffLabel(rentalDays: number) {
  return rentalDays >= 8 ? "8–30 dní" : "1–7 dní";
}

export default function Home() {
  const router = useRouter();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationError, setReservationError] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState("");

  const rentalDays = useMemo(() => countDays(dateFrom, dateTo), [dateFrom, dateTo]);

  async function searchCars() {
    setError("");
    setSearched(false);

    if (!dateFrom || !dateTo) {
      setError("Vyberte datum od i datum do.");
      return;
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (from >= to) {
      setError("Datum vrácení musí být později než datum převzetí.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Nepodařilo se načíst dostupná vozidla.");
        setCars([]);
        return;
      }

      setCars(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setError("Došlo k chybě při komunikaci se serverem.");
      setCars([]);
    } finally {
      setLoading(false);
    }
  }

  function openReservation(car: CarItem) {
    setSelectedCar(car);
    setReservationError("");
    setReservationSuccess("");
  }

  function closeReservation() {
    setSelectedCar(null);
    setReservationError("");
    setReservationSuccess("");
  }

  async function submitReservation() {
    if (!selectedCar) return;

    setReservationError("");
    setReservationSuccess("");

    try {
      setReservationLoading(true);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carVariantId: selectedCar.id,
          dateFrom: new Date(dateFrom).toISOString(),
          dateTo: new Date(dateTo).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(
            `/prihlaseni?callbackUrl=${encodeURIComponent(
              `${window.location.pathname}?dateFrom=${dateFrom}&dateTo=${dateTo}`
            )}`
          );
          return;
        }

        if (
          typeof data?.error === "string" &&
          data.error.includes("profil řidiče")
        ) {
          router.push("/ucet/udaje");
          return;
        }

        setReservationError(data?.error ?? "Rezervaci se nepodařilo uložit.");
        return;
      }

      setReservationSuccess(
        `Rezervace byla vytvořena. Celková cena je ${formatPrice(data.totalPrice)}.`
      );

      await searchCars();

      setTimeout(() => {
        closeReservation();
        router.push("/moje-rezervace");
      }, 1200);
    } catch (error) {
      console.error("SUBMIT_RESERVATION_ERROR", error);
      setReservationError("Došlo k chybě při ukládání rezervace.");
    } finally {
      setReservationLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="border-b border-neutral-200 px-6 py-8 md:px-10">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              OKIM GO
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Rezervace vozidla
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 md:text-base">
              Nejdříve si vyberte termín zapůjčení. Poté vám zobrazíme pouze vozy,
              které jsou ve zvoleném období skutečně dostupné.
            </p>
          </div>

          <div className="px-6 py-6 md:px-10 md:py-8">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Datum převzetí
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Datum vrácení
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-neutral-900"
                />
              </div>

              <button
                onClick={searchCars}
                disabled={loading}
                className="h-12 rounded-2xl bg-neutral-900 px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Načítám..." : "Zobrazit dostupná auta"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {rentalDays > 0 && (
                <div className="rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
                  Délka pronájmu: <strong>{rentalDays}</strong> dnů
                </div>
              )}

              {error && (
                <div className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-8">
          {!searched && !loading && (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-neutral-500">
              Vyberte termín a zobrazíme dostupné vozy.
            </div>
          )}

          {searched && cars.length === 0 && !loading && !error && (
            <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold">Žádné dostupné vozy</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Ve zvoleném období momentálně nemáme volné vozidlo. Zkuste jiný termín.
              </p>
            </div>
          )}

          {cars.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Dostupná vozidla
                </h2>
                <p className="text-sm text-neutral-500">
                  Nalezeno vozů: <strong>{cars.length}</strong>
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {cars.map((car) => {
                  const pricePerDay = getPricePerDay(car, rentalDays);
                  const totalPrice = rentalDays > 0 ? rentalDays * pricePerDay : 0;

                  return (
                    <article
                      key={car.id}
                      className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
  {car.image ? (
    <img
      src={car.image}
      alt={`${car.carModel.brand} ${car.carModel.model} ${car.name}`}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-100" />
  )}
</div>

                      <div className="p-6">
                        <div className="mb-3">
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                            {car.carModel.brand}
                          </p>
                          <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                            {car.carModel.model}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-600">{car.name}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="rounded-2xl bg-neutral-100 px-3 py-3">
                            <div className="text-neutral-500">Převodovka</div>
                            <div className="mt-1 font-medium text-neutral-900">
                              {car.transmission}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-neutral-100 px-3 py-3">
                            <div className="text-neutral-500">Palivo</div>
                            <div className="mt-1 font-medium text-neutral-900">
                              {car.fuel}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-neutral-100 px-3 py-3">
                            <div className="text-neutral-500">Míst</div>
                            <div className="mt-1 font-medium text-neutral-900">
                              {car.seats}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 rounded-2xl bg-neutral-50 p-4 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500">1–7 dní</span>
                            <strong className="text-neutral-900">
                              {formatPrice(car.pricePerDayShort)} / den
                            </strong>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500">8–30 dní</span>
                            <strong className="text-neutral-900">
                              {formatPrice(car.pricePerDayLong)} / den
                            </strong>
                          </div>
                        </div>

                        <div className="mt-5 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-sm text-neutral-500">Vybraná sazba</p>
                            <p className="text-2xl font-semibold">
                              {formatPrice(pricePerDay)}
                            </p>
                            {rentalDays > 0 && (
                              <p className="mt-1 text-xs text-neutral-500">
                                Tarif: {getTariffLabel(rentalDays)}
                              </p>
                            )}
                          </div>

                          {rentalDays > 0 && (
                            <div className="text-right">
                              <p className="text-sm text-neutral-500">
                                Celkem za {rentalDays} dnů
                              </p>
                              <p className="text-xl font-semibold">
                                {formatPrice(totalPrice)}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => openReservation(car)}
                          className="mt-5 h-11 w-full rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                          Rezervovat vozidlo
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </section>

      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-neutral-500">
                  Rezervace vozidla
                </p>
                <h3 className="mt-1 text-2xl font-semibold">
                  {selectedCar.carModel.brand} {selectedCar.carModel.model}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">{selectedCar.name}</p>
              </div>

              <button
                onClick={closeReservation}
                className="rounded-full border border-neutral-300 px-3 py-1 text-sm"
              >
                Zavřít
              </button>
            </div>

            <div className="mb-5 rounded-2xl bg-neutral-100 p-4 text-sm">
              <div>
                Termín: <strong>{dateFrom}</strong> – <strong>{dateTo}</strong>
              </div>
              <div className="mt-1">
                Délka pronájmu: <strong>{rentalDays}</strong> dnů
              </div>
              <div className="mt-1">
                Tarif:{" "}
                <strong>{getTariffLabel(rentalDays)}</strong>
              </div>
              <div className="mt-1">
                Cena za den:{" "}
                <strong>
                  {formatPrice(getPricePerDay(selectedCar, rentalDays))}
                </strong>
              </div>
              <div className="mt-1">
                Cena celkem:{" "}
                <strong>
                  {formatPrice(rentalDays * getPricePerDay(selectedCar, rentalDays))}
                </strong>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-neutral-700">
              <p className="font-medium text-neutral-900">
                Rezervace bude vytvořena na údaje z vašeho účtu.
              </p>
              <p className="mt-2">
                Pokud nejste přihlášený, budete přesměrován na přihlášení.
              </p>
              <p className="mt-1">
                Pokud nemáte doplněný profil řidiče, budete přesměrován do sekce
                <strong> Moje údaje</strong>.
              </p>
            </div>

            {reservationError && (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {reservationError}
              </div>
            )}

            {reservationSuccess && (
              <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {reservationSuccess}
              </div>
            )}

            {!reservationSuccess && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={submitReservation}
                  disabled={reservationLoading}
                  className="h-12 flex-1 rounded-2xl bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  {reservationLoading ? "Ukládám..." : "Potvrdit rezervaci"}
                </button>

                <button
                  onClick={closeReservation}
                  className="h-12 rounded-2xl border border-neutral-300 px-5 text-sm font-medium"
                >
                  Zrušit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}