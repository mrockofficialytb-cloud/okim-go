import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getReservationStatusBadgeClass,
  getReservationStatusLongLabel,
  type ReservationStatus,
} from "@/lib/reservation-status";

export const dynamic = "force-dynamic";

export default async function MyReservationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/moje-rezervace");
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
    },
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
  });

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">Moje rezervace</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Přehled vašich aktuálních i minulých rezervací.
        </p>

        <div className="mt-8 space-y-4">
          {reservations.length === 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              Zatím nemáte žádné rezervace.
            </div>
          )}

          {reservations.map((reservation) => {
            const status = reservation.status as ReservationStatus;

            return (
              <Link
                key={reservation.id}
                href={`/moje-rezervace/${reservation.id}`}
                className="block rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {reservation.carVariant.carModel.brand}{" "}
                      {reservation.carVariant.carModel.model}
                    </h2>

                    <p className="mt-1 text-sm text-neutral-600">
                      Varianta: {reservation.carVariant.name}
                    </p>

                    <p className="mt-1 text-sm text-neutral-600">
                      Termín:{" "}
                      {new Date(reservation.dateFrom).toLocaleDateString("cs-CZ")} –{" "}
                      {new Date(reservation.dateTo).toLocaleDateString("cs-CZ")}
                    </p>

                    <p className="mt-1 text-sm font-medium text-neutral-900">
                      Cena: {reservation.totalPrice} Kč
                    </p>
                  </div>

                  <div className={getReservationStatusBadgeClass(status)}>
                    {getReservationStatusLongLabel(status)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}