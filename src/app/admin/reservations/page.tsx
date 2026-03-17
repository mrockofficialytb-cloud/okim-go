import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin-nav";
import AdminReservationActions from "@/components/admin-reservation-actions";

export const dynamic = "force-dynamic";

function statusLabel(
  status: "PENDING" | "CONFIRMED" | "PICKED_UP" | "RETURNED" | "CANCELED"
) {
  if (status === "PENDING") return "Čeká na schválení";
  if (status === "CONFIRMED") return "Schváleno";
  if (status === "PICKED_UP") return "Půjčeno";
  if (status === "RETURNED") return "Dokončeno";
  return "Zrušeno";
}

export default async function AdminReservationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/admin/reservations");
  }

  if (!["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
  redirect("/");
}

  const reservations = await prisma.reservation.findMany({
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
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Rezervace
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          Správa rezervací v systému autopůjčovny.
        </p>

        <div className="mt-6">
          <AdminNav current="reservations" />
        </div>

        <div className="mt-8 space-y-4">

          {reservations.length === 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              Žádné rezervace.
            </div>
          )}

          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
            >
              <div className="flex flex-col gap-5">

                {/* INFO */}
                <div className="space-y-1">

                  <h3 className="text-lg font-semibold leading-tight">
                    {reservation.carVariant.carModel.brand}{" "}
                    {reservation.carVariant.carModel.model}
                  </h3>

                  <div className="text-sm text-neutral-600">
                    {reservation.carVariant.name}
                  </div>

                  <div className="text-sm text-neutral-700">
                    {reservation.customerName}
                  </div>

                  <div className="break-all text-sm text-neutral-500">
                    {reservation.email}
                  </div>

                  <div className="text-sm text-neutral-600">
                    {new Date(reservation.dateFrom).toLocaleDateString("cs-CZ")} –{" "}
                    {new Date(reservation.dateTo).toLocaleDateString("cs-CZ")}
                  </div>

                  <div className="text-sm font-medium">
                    {reservation.totalPrice} Kč
                  </div>

                  <div className="text-sm text-neutral-500">
                    Stav: {statusLabel(reservation.status)}
                  </div>

                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                  <Link
                    href={`/admin/reservations/${reservation.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    Detail rezervace
                  </Link>

                  <div className="flex flex-wrap gap-2">
                    <AdminReservationActions
                      reservationId={reservation.id}
                      status={reservation.status}
                    />
                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}