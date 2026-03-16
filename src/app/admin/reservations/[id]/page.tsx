import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin-nav";
import AdminReservationActions from "@/components/admin-reservation-actions";
import AdminReservationDepositForm from "@/components/admin-reservation-deposit-form";
import AdminReservationScheduleForm from "@/components/admin-reservation-schedule-form";
import {
  getReservationStatusBadgeClass,
  getReservationStatusLabel,
  type ReservationStatus,
} from "@/lib/reservation-status";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function depositStatusLabel(status?: "UNPAID" | "PAID" | "RETURNED" | null) {
  if (status === "UNPAID") return "Nezaplacena";
  if (status === "PAID") return "Zaplacena";
  if (status === "RETURNED") return "Vrácena";
  return "—";
}

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("cs-CZ");
}

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("cs-CZ");
}

function formatTime(value?: string | null) {
  return value || "—";
}

function rentalDays(dateFrom: Date, dateTo: Date) {
  return Math.ceil(
    (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default async function AdminReservationDetailPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: true,
      carVariant: {
        include: {
          carModel: true,
        },
      },
    },
  });

  if (!reservation) {
    redirect("/admin");
  }

  const status = reservation.status as ReservationStatus;
  const canDownloadContract =
    reservation.status === "PICKED_UP" ||
    reservation.status === "RETURNED" ||
    !!reservation.pickupAt;

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold tracking-tight">Detail rezervace</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Přehled rezervace, zákazníka a provozních údajů.
        </p>

        <div className="mt-6">
          <AdminNav current="reservations" />
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {reservation.carVariant.carModel.brand}
              </p>

              <h2 className="mt-1 text-3xl font-bold text-neutral-900">
                {reservation.carVariant.carModel.model}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                  {reservation.carVariant.name}
                </span>
              </div>

              <p className="mt-3 text-sm text-neutral-600">
                Termín: {formatDate(reservation.dateFrom)} –{" "}
                {formatDate(reservation.dateTo)}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                ID rezervace: {reservation.id}
              </p>
            </div>

            <div
              className={`${getReservationStatusBadgeClass(
                status
              )} px-4 py-2 text-sm`}
            >
              {getReservationStatusLabel(status)}
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-8">
            <h3 className="text-lg font-semibold text-neutral-900">
              Souhrn rezervace
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
              <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Délka pronájmu
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-900">
                  {rentalDays(reservation.dateFrom, reservation.dateTo)} dní
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Cena
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-900">
                  {reservation.totalPrice} Kč
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Kauce
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-900">
                  {reservation.depositAmount != null
                    ? `${reservation.depositAmount} Kč`
                    : "—"}
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Stav kauce
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-900">
                  {depositStatusLabel(reservation.depositStatus)}
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Čas vyzvednutí
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-900">
                  {formatTime(reservation.pickupTimePlanned)}
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Čas vrácení
                </div>
                <div className="mt-2 text-lg font-semibold text-neutral-900">
                  {formatTime(reservation.returnTimePlanned)}
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Vytvořeno
                </div>
                <div className="mt-2 text-sm font-semibold text-neutral-900">
                  {formatDateTime(reservation.createdAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-8">
            <h3 className="text-lg font-semibold text-neutral-900">Zákazník</h3>

            <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr_0.72fr]">
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-[180px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Jméno</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.customerName}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Email</div>
                    <div className="font-semibold text-neutral-900 break-all">
                      {reservation.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr]">
                    <div className="text-neutral-500">Telefon</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.phone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-start rounded-2xl border border-neutral-200/80 bg-white p-4">
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-[170px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Registrovaný uživatel</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.name || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[170px_1fr]">
                    <div className="text-neutral-500">Zpracoval</div>
                    <div className="font-semibold text-neutral-900">
                      {session.user.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-8">
            <h3 className="text-lg font-semibold text-neutral-900">
              Profil řidiče
            </h3>

            <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1fr_0.72fr]">
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-[180px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Jméno</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.firstName || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Příjmení</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.lastName || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Datum narození</div>
                    <div className="font-semibold text-neutral-900">
                      {formatDate(reservation.user?.dateOfBirth)}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Adresa</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.addressStreet || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Město</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.addressCity || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr]">
                    <div className="text-neutral-500">PSČ</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.addressZip || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-start rounded-2xl border border-neutral-200/80 bg-white p-4">
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-[170px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Číslo OP / pasu</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.idDocumentNumber || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[170px_1fr] border-b border-neutral-100 pb-2">
                    <div className="text-neutral-500">Řidičský průkaz</div>
                    <div className="font-semibold text-neutral-900">
                      {reservation.user?.driverLicenseNumber || "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-[170px_1fr]">
                    <div className="text-neutral-500">
                      Platnost řidičského průkazu
                    </div>
                    <div className="font-semibold text-neutral-900">
                      {formatDate(reservation.user?.driverLicenseExpiry)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-8">
            <h3 className="text-lg font-semibold text-neutral-900">Provoz</h3>

            <div className="mt-4 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <h4 className="text-base font-semibold text-neutral-900">
                  Předání vozidla
                </h4>

                <div className="mt-4 grid gap-3 text-sm text-neutral-700">
                  <div>
                    Datum a čas:{" "}
                    <strong>{formatDateTime(reservation.pickupAt)}</strong>
                  </div>
                  <div>
                    Tachometr:{" "}
                    <strong>
                      {reservation.pickupMileage != null
                        ? `${reservation.pickupMileage} km`
                        : "—"}
                    </strong>
                  </div>
                  <div>
                    Palivo: <strong>{reservation.pickupFuel || "—"}</strong>
                  </div>
                  <div>
                    Poznámka: <strong>{reservation.pickupNote || "—"}</strong>
                  </div>
                  <div>
                    Předal: <strong>{session.user.name}</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <h4 className="text-base font-semibold text-neutral-900">
                  Vrácení vozidla
                </h4>

                <div className="mt-4 grid gap-3 text-sm text-neutral-700">
                  <div>
                    Datum a čas:{" "}
                    <strong>{formatDateTime(reservation.returnAt)}</strong>
                  </div>
                  <div>
                    Tachometr:{" "}
                    <strong>
                      {reservation.returnMileage != null
                        ? `${reservation.returnMileage} km`
                        : "—"}
                    </strong>
                  </div>
                  <div>
                    Palivo: <strong>{reservation.returnFuel || "—"}</strong>
                  </div>
                  <div>
                    Poznámka: <strong>{reservation.returnNote || "—"}</strong>
                  </div>
                  <div>
                    Převzal: <strong>{session.user.name}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200 pt-8 space-y-6">
            <AdminReservationDepositForm
              reservationId={reservation.id}
              initialAmount={reservation.depositAmount}
              initialStatus={reservation.depositStatus}
            />

            <AdminReservationScheduleForm
              reservationId={reservation.id}
              initialPickupTimePlanned={reservation.pickupTimePlanned}
              initialReturnTimePlanned={reservation.returnTimePlanned}
            />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
            <div className="flex flex-wrap gap-3">
              <AdminReservationActions
                reservationId={reservation.id}
                status={reservation.status}
              />

              <Link
                href={`/api/admin/reservations/${reservation.id}/pdf`}
                target="_blank"
                className="admin-btn-outline"
              >
                Potvrzení rezervace
              </Link>

              {canDownloadContract && (
                <Link
                  href={`/api/admin/reservations/${reservation.id}/contract`}
                  target="_blank"
                  className="admin-btn-outline"
                >
                  Nájemní smlouva
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/admin/reservations" className="admin-btn-outline">
                Zpět na rezervace
              </Link>

              <Link href="/admin/calendar" className="admin-btn-outline">
                Zpět na kalendář
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}