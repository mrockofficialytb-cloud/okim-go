import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin-nav";
import {
  getReservationStatusBadgeClass,
  getReservationStatusLabel,
  type ReservationStatus,
} from "@/lib/reservation-status";
import SystemStatus from "@/components/system-status";

export const dynamic = "force-dynamic";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("cs-CZ");
}

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("cs-CZ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("cs-CZ").format(value) + " Kč";
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    reservationsToday,
    pickupsToday,
    returnsToday,
    activeRentals,
    monthReservations,
    recentReservations,
    activeVariants,
  ] = await Promise.all([
    prisma.reservation.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    prisma.reservation.count({
      where: {
        status: "CONFIRMED",
        dateFrom: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    prisma.reservation.count({
      where: {
        status: "CONFIRMED",
        dateTo: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    prisma.reservation.count({
      where: {
        status: "CONFIRMED",
        dateFrom: {
          lte: todayEnd,
        },
        dateTo: {
          gte: todayStart,
        },
      },
    }),

    prisma.reservation.findMany({
      where: {
        status: {
          not: "CANCELED",
        },
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        totalPrice: true,
      },
    }),

    prisma.reservation.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        carVariant: {
          include: {
            carModel: true,
          },
        },
      },
    }),

    prisma.carVariant.findMany({
      where: {
        active: true,
        carModel: {
          active: true,
        },
      },
      include: {
        reservations: {
          where: {
            status: {
              not: "CANCELED",
            },
            dateFrom: {
              lte: todayEnd,
            },
            dateTo: {
              gte: todayStart,
            },
          },
          select: {
            id: true,
          },
        },
        blocked: {
          where: {
            dateFrom: {
              lte: todayEnd,
            },
            dateTo: {
              gte: todayStart,
            },
          },
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  const monthRevenue = monthReservations.reduce(
    (sum, r) => sum + Number(r.totalPrice ?? 0),
    0
  );

  const availableVehiclesToday = activeVariants.reduce((sum, variant) => {
    const hasBlockingPeriod = variant.blocked.length > 0;
    if (hasBlockingPeriod) return sum;

    const occupied = variant.reservations.length;
    const free = Math.max(variant.quantity - occupied, 0);

    return sum + free;
  }, 0);

  const stats = [
    {
      title: "Rezervace dnes",
      value: reservationsToday,
      hint: "Nově vytvořené rezervace za dnešek",
    },
    {
      title: "Aktivní pronájmy",
      value: activeRentals,
      hint: "Potvrzené rezervace probíhající dnes",
    },
    {
      title: "Vyzvednutí dnes",
      value: pickupsToday,
      hint: "Vozidla určená k předání dnes",
    },
    {
      title: "Vrácení dnes",
      value: returnsToday,
      hint: "Vozidla plánovaná k vrácení dnes",
    },
    {
      title: "Měsíční obrat",
      value: formatCurrency(monthRevenue),
      hint: "Součet nezrušených rezervací tento měsíc",
    },
    {
      title: "Dostupná vozidla dnes",
      value: availableVehiclesToday,
      hint: "Aktuálně volné kusy ve flotile",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Přehled provozu autopůjčovny OKIM GO.
        </p>

        <div className="mt-6">
          <AdminNav current="dashboard" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
            >
              <div className="text-sm font-medium text-neutral-500">
                {item.title}
              </div>

              <div className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
                {item.value}
              </div>

              <div className="mt-2 text-sm text-neutral-500">{item.hint}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                Poslední rezervace
              </h2>

              <Link
                href="/admin/reservations"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Zobrazit vše
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {recentReservations.length === 0 && (
                <div className="rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
                  Zatím nejsou žádné rezervace.
                </div>
              )}

              {recentReservations.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-neutral-900">
                        {r.carVariant.carModel.brand} {r.carVariant.carModel.model}
                      </div>

                      <div className="mt-1 text-sm text-neutral-600">
                        Varianta: {r.carVariant.name}
                      </div>

                      <div className="mt-1 text-sm text-neutral-600">
                        Termín: {formatDate(r.dateFrom)} – {formatDate(r.dateTo)}
                      </div>

                      <div className="mt-2 text-sm text-neutral-700">
                        Zákazník: <strong>{r.customerName}</strong>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div
                        className={`${getReservationStatusBadgeClass(
                          r.status as ReservationStatus
                        )} px-3 py-1 text-xs`}
                      >
                        {getReservationStatusLabel(r.status as ReservationStatus)}
                      </div>

                      <Link
                        href={`/admin/reservations/${r.id}`}
                        className="inline-flex items-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                      >
                        Detail rezervace
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        Cena
                      </div>
                      <div className="mt-1 font-semibold text-neutral-900">
                        {formatCurrency(Number(r.totalPrice ?? 0))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        Vytvořeno
                      </div>
                      <div className="mt-1 font-semibold text-neutral-900">
                        {formatDateTime(r.createdAt)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        Účet
                      </div>
                      <div className="mt-1 font-semibold text-neutral-900">
                        {r.user?.name || "Bez účtu"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                Rychlé akce
              </h2>

              <div className="mt-6 grid gap-3">
                <Link
                  href="/admin/cars"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                >
                  Správa vozidel
                </Link>

                <Link
                  href="/admin/calendar"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                >
                  Kalendář obsazenosti
                </Link>

                <Link
                  href="/admin/users"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                >
                  Správa uživatelů
                </Link>

                <Link
                  href="/admin/reservations"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                >
                  Přehled rezervací
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                Dnešní provoz
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="text-sm text-neutral-600">K předání dnes</span>
                  <strong className="text-neutral-900">{pickupsToday}</strong>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="text-sm text-neutral-600">K vrácení dnes</span>
                  <strong className="text-neutral-900">{returnsToday}</strong>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="text-sm text-neutral-600">Aktivní pronájmy</span>
                  <strong className="text-neutral-900">{activeRentals}</strong>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="text-sm text-neutral-600">Volná vozidla dnes</span>
                  <strong className="text-neutral-900">{availableVehiclesToday}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <SystemStatus />

              <div className="mt-6 space-y-3 text-sm text-neutral-700">
                

                <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                  Přihlášený administrátor: <strong>{session.user.name}</strong>
                </div>

                <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                  Poslední aktualizace dashboardu:{" "}
                  <strong>{formatDateTime(new Date())}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}