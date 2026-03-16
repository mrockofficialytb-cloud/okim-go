"use client";

import Link from "next/link";
import { useState } from "react";

type CalendarReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELED";

type MobileDayItem = {
  key: string;
  dayLabel: string;
  dateLabel: string;
  reservations: Array<{
    id: string;
    customerName: string;
    status: CalendarReservationStatus;
    dateFromLabel: string;
    dateToLabel: string;
  }>;
  blocks: Array<{
    id: string;
    reason: string;
    dateFromLabel: string;
    dateToLabel: string;
  }>;
};

type MobileVariantItem = {
  id: string;
  brand: string;
  model: string;
  variant: string;
  transmission: string;
  fuel: string;
  seats: number;
  pricePerDay: number;
  days: MobileDayItem[];
};

type Props = {
  variants: MobileVariantItem[];
};

function statusLabel(status: CalendarReservationStatus) {
  if (status === "PENDING") return "Čeká";
  if (status === "CONFIRMED") return "Schváleno";
  if (status === "PICKED_UP") return "Půjčeno";
  if (status === "RETURNED") return "Dokončeno";
  return "Zrušeno";
}

function reservationClasses(status: CalendarReservationStatus) {
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

export default function AdminCalendarMobileAccordion({ variants }: Props) {
  const [openId, setOpenId] = useState<string | null>(variants[0]?.id ?? null);

  if (variants.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        Žádné varianty vozidel.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {variants.map((variant) => {
        const isOpen = openId === variant.id;

        return (
          <div
            key={variant.id}
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : variant.id)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900">
                  {variant.brand} {variant.model}
                </div>

                <div className="mt-1 text-sm text-neutral-600">
                  {variant.variant}
                </div>

                <div className="mt-2 text-xs text-neutral-500">
                  {variant.transmission} • {variant.fuel} • {variant.seats} míst
                </div>

                <div className="mt-1 text-xs text-neutral-500">
                  {variant.pricePerDay} Kč / den
                </div>
              </div>

              <div className="shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                {isOpen ? "Skrýt" : "Zobrazit"}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-neutral-200 px-4 pb-4 pt-3">
                <div className="space-y-3">
                  {variant.days.map((day) => (
                    <div
                      key={day.key}
                      className="rounded-2xl border border-neutral-200 p-3"
                    >
                      <div className="mb-2">
                        <div className="text-sm font-semibold text-neutral-900">
                          {day.dayLabel}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {day.dateLabel}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {day.reservations.map((reservation) => (
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
                              {reservation.dateFromLabel} –{" "}
                              {reservation.dateToLabel}
                            </div>
                          </Link>
                        ))}

                        {day.blocks.map((block) => (
                          <div
                            key={block.id}
                            className="rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-800"
                          >
                            <div className="font-semibold">Blokace</div>
                            <div className="mt-1 truncate">
                              {block.reason || "Bez důvodu"}
                            </div>
                            <div className="mt-1 text-[11px] opacity-80">
                              {block.dateFromLabel} – {block.dateToLabel}
                            </div>
                          </div>
                        ))}

                        {day.reservations.length === 0 &&
                          day.blocks.length === 0 && (
                            <div className="rounded-2xl bg-neutral-50 px-3 py-2 text-xs text-neutral-400">
                              Volno
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}