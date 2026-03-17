import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin-nav";
import AdminDeleteUserButton from "@/components/admin-delete-user-button";

export const dynamic = "force-dynamic";

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("cs-CZ");
}

function roleBadgeClass(role: string) {
  if (role === "ADMIN") {
    return "bg-emerald-100 text-emerald-800";
  }

  return "bg-neutral-100 text-neutral-700";
}

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/admin/users");
  }

  if (!["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
  redirect("/");
}

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          reservations: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <h1 className="text-3xl font-semibold tracking-tight">
          Uživatelé
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          Přehled registrovaných uživatelů v systému.
        </p>

        <div className="mt-6">
          <AdminNav current="users" />
        </div>

        {/* MOBILE VIEW */}
        <div className="mt-8 space-y-4 md:hidden">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-900">
                  {user.name || "—"}
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>

              <div className="mt-2 text-sm text-neutral-600">
                {user.email}
              </div>

              <div className="mt-3 text-sm text-neutral-600">
                Rezervace: {user._count.reservations}
              </div>

              <div className="mt-1 text-sm text-neutral-500">
                Vytvořeno: {formatDateTime(user.createdAt)}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  Zobrazit detail
                </Link>

                <AdminDeleteUserButton
                  userId={user.id}
                  userName={user.name || user.email}
                />
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="mt-8 hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 md:block">
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50">
              <tr className="text-left text-sm text-neutral-600">
                <th className="px-5 py-4 font-medium">Jméno</th>
                <th className="px-5 py-4 font-medium">Emailová adresa</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Rezervace</th>
                <th className="px-5 py-4 font-medium">Vytvořeno</th>
                <th className="px-5 py-4 font-medium text-right pr-[115px]">
  Akce
</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-neutral-100 transition hover:bg-neutral-50"
                >
                  <td className="px-5 py-4 text-sm font-medium text-neutral-900">
                    {user.name || "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-neutral-700">
                    {user.email}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-neutral-700">
                    {user._count.reservations}
                  </td>

                  <td className="px-5 py-4 text-sm text-neutral-700">
                    {formatDateTime(user.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                      >
                        Zobrazit detail
                      </Link>

                      <AdminDeleteUserButton
                        userId={user.id}
                        userName={user.name || user.email}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}