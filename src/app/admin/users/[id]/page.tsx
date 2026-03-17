import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin-nav";
import AdminUserNoteForm from "@/components/admin-user-note-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function statusLabel(
  status: "PENDING" | "CONFIRMED" | "PICKED_UP" | "RETURNED" | "CANCELED"
) {
  if (status === "PENDING") return "Čeká na schválení";
  if (status === "CONFIRMED") return "Schváleno";
  if (status === "PICKED_UP") return "Půjčeno";
  if (status === "RETURNED") return "Dokončeno";
  return "Zrušeno";
}

function statusClasses(
  status: "PENDING" | "CONFIRMED" | "PICKED_UP" | "RETURNED" | "CANCELED"
) {
  if (status === "PENDING") return "admin-badge-warning";
  if (status === "CONFIRMED") return "admin-badge-success";
  if (status === "PICKED_UP") return "bg-blue-100 text-blue-800";
  if (status === "RETURNED") return "bg-neutral-200 text-neutral-800";
  return "admin-badge-danger";
}

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("cs-CZ");
}

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("cs-CZ");
}

function rentalDays(dateFrom: Date, dateTo: Date) {
  return Math.ceil(
    (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default async function AdminUserDetailPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni");
  }

  if (!["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      adminNotes: {
        orderBy: {
          createdAt: "desc",
        },
      },
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
      },
    },
  });

  if (!user) {
    redirect("/admin/users");
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="admin-page-title text-3xl">Detail uživatele</h1>
        <p className="admin-page-subtitle mt-2 text-sm">
          Přehled údajů, řidičského profilu a rezervací uživatele.
        </p>

        <div className="mt-6">
          <AdminNav current="users" />
        </div>

        <div className="mt-8 admin-card p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Základní údaje</h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
              <div className="grid grid-cols-[140px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Jméno:</div>
                <div className="font-semibold text-neutral-900">
                  {user.firstName || "—"}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Příjmení:</div>
                <div className="font-semibold text-neutral-900">
                  {user.lastName || "—"}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Celé jméno:</div>
                <div className="font-semibold text-neutral-900">
                  {user.name || "—"}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Role:</div>
                <div className="font-semibold text-neutral-900">{user.role}</div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Email:</div>
                <div className="break-all font-semibold text-neutral-900">
                  {user.email}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                <div className="text-sm text-neutral-500">Telefon:</div>
                <div className="font-semibold text-neutral-900">
                  {user.phone || "—"}
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Registrován:</div>
                <div className="font-semibold text-neutral-900">
                  {formatDateTime(user.createdAt)}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Email ověřen:</div>
                <div className="font-semibold text-neutral-900">
                  {formatDateTime(user.emailVerified)}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Souhlas GDPR:</div>
                <div className="font-semibold text-neutral-900">
                  {formatDateTime(user.privacyConsentAt)}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Souhlas s podmínkami:</div>
                <div className="font-semibold text-neutral-900">
                  {formatDateTime(user.termsConsentAt)}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2">
                <div className="text-sm text-neutral-500">Marketing souhlas:</div>
                <div className="font-semibold text-neutral-900">
                  {user.marketingConsent ? "Ano" : "Ne"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 admin-card p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Profil řidiče</h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Datum narození:</div>
                <div className="font-semibold text-neutral-900">
                  {formatDate(user.dateOfBirth)}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Adresa:</div>
                <div className="font-semibold text-neutral-900">
                  {user.addressStreet || "—"}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Město:</div>
                <div className="font-semibold text-neutral-900">
                  {user.addressCity || "—"}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2">
                <div className="text-sm text-neutral-500">PSČ:</div>
                <div className="font-semibold text-neutral-900">
                  {user.addressZip || "—"}
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">Číslo OP / pasu:</div>
                <div className="font-semibold text-neutral-900">
                  {user.idDocumentNumber || "—"}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                <div className="text-sm text-neutral-500">
                  Číslo řidičského průkazu:
                </div>
                <div className="font-semibold text-neutral-900">
                  {user.driverLicenseNumber || "—"}
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-start gap-2">
                <div className="text-sm text-neutral-500">
                  Platnost řidičského průkazu:
                </div>
                <div className="font-semibold text-neutral-900">
                  {formatDate(user.driverLicenseExpiry)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <AdminUserNoteForm
            userId={user.id}
            notes={user.adminNotes}
            currentUserRole={session.user.role}
          />
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Rezervace uživatele
            </h2>

            <Link href="/admin/users" className="admin-btn-outline">
              Zpět na uživatele
            </Link>
          </div>

          <div className="space-y-4">
            {user.reservations.length === 0 && (
              <div className="admin-card p-6">
                Uživatel zatím nemá žádné rezervace.
              </div>
            )}

            {user.reservations.map((r) => (
              <div key={r.id} className="admin-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {r.carVariant.carModel.brand} {r.carVariant.carModel.model}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Varianta: {r.carVariant.name}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Termín: {formatDate(r.dateFrom)} – {formatDate(r.dateTo)}
                    </p>
                  </div>

                  <div className={statusClasses(r.status)}>{statusLabel(r.status)}</div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
                    <div className="grid grid-cols-[160px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                      <div className="text-sm text-neutral-500">Zákazník:</div>
                      <div className="font-semibold text-neutral-900">{r.customerName}</div>
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                      <div className="text-sm text-neutral-500">Email:</div>
                      <div className="break-all font-semibold text-neutral-900">{r.email}</div>
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                      <div className="text-sm text-neutral-500">Telefon:</div>
                      <div className="font-semibold text-neutral-900">{r.phone}</div>
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-start gap-2">
                      <div className="text-sm text-neutral-500">Délka pronájmu:</div>
                      <div className="font-semibold text-neutral-900">
                        {rentalDays(r.dateFrom, r.dateTo)} dní
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4">
                    <div className="grid grid-cols-[160px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                      <div className="text-sm text-neutral-500">Cena:</div>
                      <div className="font-semibold text-neutral-900">{r.totalPrice} Kč</div>
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                      <div className="text-sm text-neutral-500">Kauce:</div>
                      <div className="font-semibold text-neutral-900">
                        {r.depositAmount != null ? `${r.depositAmount} Kč` : "—"}
                      </div>
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-start gap-2 border-b border-neutral-100 pb-3">
                      <div className="text-sm text-neutral-500">Stav kauce:</div>
                      <div className="font-semibold text-neutral-900">
                        {r.depositStatus === "UNPAID"
                          ? "Nezaplacena"
                          : r.depositStatus === "PAID"
                          ? "Zaplacena"
                          : r.depositStatus === "RETURNED"
                          ? "Vrácena"
                          : "—"}
                      </div>
                    </div>

                    <div className="grid grid-cols-[160px_1fr] items-start gap-2">
                      <div className="text-sm text-neutral-500">Vytvořeno:</div>
                      <div className="font-semibold text-neutral-900">
                        {formatDateTime(r.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/reservations/${r.id}`}
                      className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                    >
                      Detail rezervace
                    </Link>
                  </div>

                  <div className="text-sm text-neutral-500">
                    Zpracoval:{" "}
                    <span className="font-medium text-neutral-900">
                      {session.user.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}