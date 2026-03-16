import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import MyReservationCancelButton from "@/components/my-reservation-cancel-button";
import {
  getReservationStatusBadgeClass,
  getReservationStatusLongLabel,
  type ReservationStatus,
} from "@/lib/reservation-status";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("cs-CZ");
}

export default async function MyReservationDetailPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/moje-rezervace");
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      carVariant: {
        include: {
          carModel: true,
        },
      },
    },
  });

  if (!reservation) {
    redirect("/moje-rezervace");
  }

  const status = reservation.status as ReservationStatus;

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/moje-rezervace"
            className="inline-flex items-center rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            ← Zpět na moje rezervace
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {reservation.carVariant.carModel.brand}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                {reservation.carVariant.carModel.model}
              </h1>

              <p className="mt-2 text-sm text-neutral-600">
                Varianta: {reservation.carVariant.name}
              </p>
            </div>

            <div className={getReservationStatusBadgeClass(status)}>
              {getReservationStatusLongLabel(status)}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              Termín od:{" "}
              <strong>
                {new Date(reservation.dateFrom).toLocaleDateString("cs-CZ")}
              </strong>
            </div>

            <div>
              Termín do:{" "}
              <strong>
                {new Date(reservation.dateTo).toLocaleDateString("cs-CZ")}
              </strong>
            </div>

            <div>
              Cena: <strong>{reservation.totalPrice} Kč</strong>
            </div>

            <div>
              Jméno v rezervaci: <strong>{reservation.customerName}</strong>
            </div>

            <div>
              Email: <strong>{reservation.email}</strong>
            </div>

            <div>
              Telefon: <strong>{reservation.phone}</strong>
            </div>

            <div>
              Stav rezervace: <strong>{getReservationStatusLongLabel(status)}</strong>
            </div>

            <div>
              Vytvořeno: <strong>{formatDateTime(reservation.createdAt)}</strong>
            </div>

            <div>
              Předání vozidla: <strong>{formatDateTime(reservation.pickupAt)}</strong>
            </div>

            <div>
              Vrácení vozidla: <strong>{formatDateTime(reservation.returnAt)}</strong>
            </div>
          </div>

          <MyReservationCancelButton
            reservationId={reservation.id}
            status={reservation.status}
          />
        </div>
      </div>
    </main>
  );
}