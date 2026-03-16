import Link from "next/link";
import { redirect } from "next/navigation";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { cs } from "date-fns/locale";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin-nav";
import AdminCalendarMobileAccordion from "@/components/admin-calendar-mobile-accordion";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  weekStart?: string;
}>;

function normalizeWeekStart(input?: string) {
  if (!input) {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  const parsed = parseISO(input);
  if (Number.isNaN(parsed.getTime())) {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  return startOfWeek(parsed, { weekStartsOn: 1 });
}

function statusLabel(
  status: "PENDING" | "CONFIRMED" | "PICKED_UP" | "RETURNED" | "CANCELED"
) {
  if (status === "PENDING") return "Čeká";
  if (status === "CONFIRMED") return "Schváleno";
  if (status === "PICKED_UP") return "Půjčeno";
  if (status === "RETURNED") return "Dokončeno";
  return "Zrušeno";
}

function reservationClasses(
  status: "PENDING" | "CONFIRMED" | "PICKED_UP" | "RETURNED" | "CANCELED"
) {
  if (status === "PENDING") {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }

  if (status === "CONFIRMED") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (status === "PICKED_UP") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (status === "RETURNED") {
    return "bg-neutral-200 text-neutral-800 border-neutral-300";
  }

  return "bg-red-100 text-red-800 border-red-200";
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/admin/calendar");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const weekStart = normalizeWeekStart(params?.weekStart);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const variants = await prisma.carVariant.findMany({
    include: {
      carModel: true,
      reservations: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "PICKED_UP"],
          },
          dateFrom: {
            lt: addDays(weekEnd, 1),
          },
          dateTo: {
            gt: weekStart,
          },
        },
        orderBy: {
          dateFrom: "asc",
        },
      },
      blocked: {
        where: {
          dateFrom: {
            lt: addDays(weekEnd, 1),
          },
          dateTo: {
            gt: weekStart,
          },
        },
        orderBy: {
          dateFrom: "asc",
        },
      },
    },
    orderBy: [
      {
        carModel: {
          brand: "asc",
        },
      },
      {
        carModel: {
          model: "asc",
        },
      },
      {
        name: "asc",
      },
    ],
  });

  const prevWeek = format(subWeeks(weekStart, 1), "yyyy-MM-dd");
  const nextWeek = format(addWeeks(weekStart, 1), "yyyy-MM-dd");

  const mobileVariants = variants.map((variant) => ({
    id: variant.id,
    brand: variant.carModel.brand,
    model: variant.carModel.model,
    variant: variant.name,
    transmission: variant.transmission,
    fuel: variant.fuel,
    seats: variant.seats,
    pricePerDay: variant.pricePerDay,
    days: days.map((day) => {
      const currentDay = startOfDay(day);

      const dayReservations = variant.reservations.filter((reservation) =>
        isWithinInterval(currentDay, {
          start: startOfDay(new Date(reservation.dateFrom)),
          end: startOfDay(new Date(reservation.dateTo)),
        })
      );

      const dayBlocks = variant.blocked.filter((block) =>
        isWithinInterval(currentDay, {
          start: startOfDay(new Date(block.dateFrom)),
          end: startOfDay(new Date(block.dateTo)),
        })
      );

      return {
        key: `${variant.id}-${day.toISOString()}`,
        dayLabel: format(day, "EEEE", { locale: cs }),
        dateLabel: format(day, "d. M. yyyy", { locale: cs }),
        reservations: dayReservations.map((reservation) => ({
          id: reservation.id,
          customerName: reservation.customerName,
          status: reservation.status,
          dateFromLabel: format(new Date(reservation.dateFrom), "d. M."),
          dateToLabel: format(new Date(reservation.dateTo), "d. M."),
        })),
        blocks: dayBlocks.map((block) => ({
          id: block.id,
          reason: block.reason || "Bez důvodu",
          dateFromLabel: format(new Date(block.dateFrom), "d. M."),
          dateToLabel: format(new Date(block.dateTo), "d. M."),
        })),
      };
    }),
  }));

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 xl:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Kalendář obsazenosti
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          Týdenní přehled rezervací a blokací jednotlivých variant vozidel.
        </p>

        <div className="mt-6">
          <AdminNav current="calendar" />
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-medium text-neutral-500">
                Zobrazený týden
              </div>
              <div className="mt-1 text-xl font-semibold text-neutral-900 sm:text-2xl">
                {format(weekStart, "d. M. yyyy", { locale: cs })} –{" "}
                {format(weekEnd, "d. M. yyyy", { locale: cs })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={`/admin/calendar?weekStart=${prevWeek}`}
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                ← Předchozí týden
              </Link>

              <Link
                href={`/admin/calendar?weekStart=${format(
                  startOfWeek(new Date(), { weekStartsOn: 1 }),
                  "yyyy-MM-dd"
                )}`}
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Tento týden
              </Link>

              <Link
                href={`/admin/calendar?weekStart=${nextWeek}`}
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Další týden →
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Schválená rezervace
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-800">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Čeká na schválení
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-blue-800">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Převzato
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-slate-800">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
              Blokace
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET ACCORDION */}
        <div className="mt-6 xl:hidden">
          <AdminCalendarMobileAccordion variants={mobileVariants} />
        </div>

        {/* DESKTOP TABLE */}
        <div className="mt-6 hidden overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm xl:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] table-fixed border-separate border-spacing-0">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="w-[260px] border-b border-neutral-200 px-4 py-4 text-left text-sm font-semibold text-neutral-900">
                    Vozidlo / varianta
                  </th>

                  {days.map((day) => (
                    <th
                      key={day.toISOString()}
                      className="w-[calc((100%-260px)/7)] border-b border-neutral-200 px-2 py-4 text-left"
                    >
                      <div className="text-sm font-semibold text-neutral-900">
                        {format(day, "EEEE", { locale: cs })}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {format(day, "d. M. yyyy", { locale: cs })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {variants.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-sm text-neutral-500"
                    >
                      Žádné varianty vozidel.
                    </td>
                  </tr>
                )}

                {variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="border-b border-neutral-200 px-4 py-4 align-top">
                      <div className="text-sm font-semibold text-neutral-900">
                        {variant.carModel.brand} {variant.carModel.model}
                      </div>
                      <div className="mt-1 text-sm text-neutral-600">
                        {variant.name}
                      </div>
                      <div className="mt-2 text-xs text-neutral-500">
                        {variant.transmission} • {variant.fuel} • {variant.seats} míst
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {variant.pricePerDay} Kč / den
                      </div>
                    </td>

                    {days.map((day) => {
                      const currentDay = startOfDay(day);

                      const dayReservations = variant.reservations.filter((reservation) =>
                        isWithinInterval(currentDay, {
                          start: startOfDay(new Date(reservation.dateFrom)),
                          end: startOfDay(new Date(reservation.dateTo)),
                        })
                      );

                      const dayBlocks = variant.blocked.filter((block) =>
                        isWithinInterval(currentDay, {
                          start: startOfDay(new Date(block.dateFrom)),
                          end: startOfDay(new Date(block.dateTo)),
                        })
                      );

                      return (
                        <td
                          key={`${variant.id}-${day.toISOString()}`}
                          className="border-b border-l border-neutral-200 px-2 py-3 align-top"
                        >
                          <div className="space-y-2">
                            {dayReservations.map((reservation) => (
                              <Link
                                key={reservation.id}
                                href={`/admin/reservations/${reservation.id}`}
                                className={`block rounded-2xl border px-3 py-2 text-xs transition hover:shadow-sm ${reservationClasses(
                                  reservation.status
                                )}`}
                              >
                                <div className="font-semibold">
                                  {statusLabel(reservation.status)}
                                </div>
                                <div className="mt-1 truncate">
                                  {reservation.customerName}
                                </div>
                                <div className="mt-1 text-[11px] opacity-80">
                                  {format(new Date(reservation.dateFrom), "d. M.")} –{" "}
                                  {format(new Date(reservation.dateTo), "d. M.")}
                                </div>
                              </Link>
                            ))}

                            {dayBlocks.map((block) => (
                              <div
                                key={block.id}
                                className="rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-800"
                              >
                                <div className="font-semibold">Blokace</div>
                                <div className="mt-1 truncate">
                                  {block.reason || "Bez důvodu"}
                                </div>
                                <div className="mt-1 text-[11px] opacity-80">
                                  {format(new Date(block.dateFrom), "d. M.")} –{" "}
                                  {format(new Date(block.dateTo), "d. M.")}
                                </div>
                              </div>
                            ))}

                            {dayReservations.length === 0 &&
                              dayBlocks.length === 0 && (
                                <div className="rounded-2xl bg-neutral-50 px-3 py-2 text-xs text-neutral-400">
                                  Volno
                                </div>
                              )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}