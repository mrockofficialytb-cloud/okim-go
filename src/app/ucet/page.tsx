import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function statusLabel(status: "PENDING" | "CONFIRMED" | "CANCELED") {
  if (status === "PENDING") return "Čeká na schválení";
  if (status === "CONFIRMED") return "Potvrzeno";
  return "Zrušeno";
}

function statusClasses(status: "PENDING" | "CONFIRMED" | "CANCELED") {
  if (status === "PENDING") {
    return "inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800";
  }

  if (status === "CONFIRMED") {
    return "inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800";
  }

  return "inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700";
}

function calculateProfileCompletion(user: {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressZip: string | null;
  idDocumentNumber: string | null;
  driverLicenseNumber: string | null;
  driverLicenseExpiry: Date | null;
}) {
  const fields = [
    user.firstName,
    user.lastName,
    user.phone,
    user.dateOfBirth,
    user.addressStreet,
    user.addressCity,
    user.addressZip,
    user.idDocumentNumber,
    user.driverLicenseNumber,
    user.driverLicenseExpiry,
  ];

  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/ucet");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      reservations: {
        include: {
          carVariant: {
            include: {
              carModel: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileCompletion = calculateProfileCompletion(user);

  const totalReservations = await prisma.reservation.count({
    where: {
      userId: user.id,
    },
  });

  const activeReservations = await prisma.reservation.count({
    where: {
      userId: user.id,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
  });

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
            Můj účet
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Správa rezervací, osobních údajů a profilu řidiče.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          {/* LEVÁ HLAVNÍ ČÁST */}
          <div className="space-y-6">
            {/* PROFIL KARTA */}
            <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
           <div
  className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 px-6 py-6"
  style={{ color: "#f5f5f5" }}
>
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-4">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full ring-1"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "#ffffff",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <span className="text-xl font-semibold">{initials}</span>
      </div>

      <div>
        <div
          className="text-2xl font-semibold"
          style={{ color: "#ffffff" }}
        >
          {user.name || "Uživatel"}
        </div>

        <div
          className="mt-1 text-sm"
          style={{ color: "#d4d4d8" }}
        >
          {user.email}
        </div>

        <div
          className="mt-2 inline-flex items-center gap-2 text-sm"
          style={{ color: "#34d399" }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#34d399" }}
          />
          {user.emailVerified ? "Email ověřen" : "Email neověřen"}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
      <div
        className="rounded-2xl px-4 py-3 ring-1"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,255,255,0.10)",
        }}
      >
        <div
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: "#d4d4d8" }}
        >
          Rezervace celkem
        </div>
        <div
          className="mt-2 text-2xl font-semibold"
          style={{ color: "#ffffff" }}
        >
          {totalReservations}
        </div>
      </div>

      <div
        className="rounded-2xl px-4 py-3 ring-1"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,255,255,0.10)",
        }}
      >
        <div
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: "#d4d4d8" }}
        >
          Aktivní
        </div>
        <div
          className="mt-2 text-2xl font-semibold"
          style={{ color: "#ffffff" }}
        >
          {activeReservations}
        </div>
      </div>
    </div>
  </div>
</div>

              <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
                <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Telefon
                  </div>
                  <div className="mt-2 text-sm font-medium text-neutral-900">
                    {user.phone || "Není doplněn"}
                  </div>
                </div>

                <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Profil řidiče
                  </div>
                  <div className="mt-2 text-sm font-medium text-neutral-900">
                    {profileCompletion} %
                  </div>
                </div>

                <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Účet vytvořen
                  </div>
                  <div className="mt-2 text-sm font-medium text-neutral-900">
                    {new Date(user.createdAt).toLocaleDateString("cs-CZ")}
                  </div>
                </div>
              </div>
            </section>

            {/* RYCHLÉ AKCE */}
            <section className="grid gap-4 md:grid-cols-3">
              <Link
                href="/moje-rezervace"
                className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition group-hover:bg-neutral-900 group-hover:text-white">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-neutral-950">
                  Moje rezervace
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Přehled aktuálních i minulých rezervací včetně detailu a stavu.
                </p>
              </Link>

              <Link
                href="/ucet/udaje"
                className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition group-hover:bg-neutral-900 group-hover:text-white">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-neutral-950">
                  Moje údaje
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Doplňte řidičský profil, adresu a údaje potřebné pro převzetí vozidla.
                </p>
              </Link>

              <Link
                href="/zapomenute-heslo"
                className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 transition group-hover:bg-neutral-900 group-hover:text-white">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-neutral-950">
                  Změna hesla
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Nastavení nového hesla a zabezpečení vašeho účtu.
                </p>
              </Link>
            </section>

            {/* POSLEDNÍ REZERVACE */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                    Poslední rezervace
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Rychlý přehled vašich posledních rezervací.
                  </p>
                </div>

                <Link
                  href="/moje-rezervace"
                  className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                >
                  Zobrazit vše
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {user.reservations.length === 0 && (
                  <div className="rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-neutral-500">
                    Zatím nemáte žádné rezervace.
                  </div>
                )}

                {user.reservations.map((reservation) => (
                  <Link
                    key={reservation.id}
                    href={`/moje-rezervace/${reservation.id}`}
                    className="block rounded-2xl border border-neutral-200 px-5 py-4 transition hover:bg-neutral-50"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-neutral-950">
                          {reservation.carVariant.carModel.brand}{" "}
                          {reservation.carVariant.carModel.model}
                        </div>
                        <div className="mt-1 text-sm text-neutral-600">
                          {reservation.carVariant.name}
                        </div>
                        <div className="mt-2 text-sm text-neutral-600">
                          {new Date(reservation.dateFrom).toLocaleDateString("cs-CZ")} –{" "}
                          {new Date(reservation.dateTo).toLocaleDateString("cs-CZ")}
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <div className={statusClasses(reservation.status)}>
                          {statusLabel(reservation.status)}
                        </div>
                        <div className="text-sm font-medium text-neutral-900">
                          {reservation.totalPrice} Kč
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* PRAVÝ SIDEBAR */}
          <div className="space-y-6">
            {/* STAV PROFILU */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold text-neutral-950">
                Stav profilu řidiče
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Pro rezervaci je potřeba mít doplněné všechny povinné údaje.
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Dokončení profilu</span>
                  <span className="font-semibold text-neutral-950">
                    {profileCompletion} %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Jméno a příjmení</span>
                  <span className={user.firstName && user.lastName ? "text-emerald-600" : "text-red-600"}>
                    {user.firstName && user.lastName ? "Vyplněno" : "Chybí"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Telefon</span>
                  <span className={user.phone ? "text-emerald-600" : "text-red-600"}>
                    {user.phone ? "Vyplněno" : "Chybí"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Adresa</span>
                  <span
                    className={
                      user.addressStreet && user.addressCity && user.addressZip
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {user.addressStreet && user.addressCity && user.addressZip
                      ? "Vyplněno"
                      : "Chybí"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Doklad totožnosti</span>
                  <span className={user.idDocumentNumber ? "text-emerald-600" : "text-red-600"}>
                    {user.idDocumentNumber ? "Vyplněno" : "Chybí"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Řidičský průkaz</span>
                  <span
                    className={
                      user.driverLicenseNumber && user.driverLicenseExpiry
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {user.driverLicenseNumber && user.driverLicenseExpiry
                      ? "Vyplněno"
                      : "Chybí"}
                  </span>
                </div>
              </div>

              <Link
                href="/ucet/udaje"
                className="mt-6 inline-flex h-11 items-center rounded-2xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Upravit údaje
              </Link>
            </section>

            {/* RYCHLÉ INFO */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold text-neutral-950">
                Důležité informace
              </h2>

              <div className="mt-4 space-y-4 text-sm text-neutral-600">
                <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                  Pro úspěšné dokončení rezervace je nutné mít vyplněný profil řidiče.
                </div>

                <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                  V detailu rezervace najdete aktuální stav i všechny termíny.
                </div>

                <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                  Změnu hesla provedete přes zabezpečený emailový odkaz.
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}