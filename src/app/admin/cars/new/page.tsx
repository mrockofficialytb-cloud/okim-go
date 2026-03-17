import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function NewCarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/admin/cars/new");
  }

  if (!["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
  redirect("/");
}

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Přidat vozidlo
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          Vytvoření nového modelu vozidla.
        </p>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">

          <form className="space-y-6">

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium">
                Značka
              </label>
              <input
                type="text"
                name="brand"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
                placeholder="Volkswagen"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium">
                Model
              </label>
              <input
                type="text"
                name="model"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
                placeholder="Multivan"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
                placeholder="volkswagen-multivan"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-2 text-white hover:bg-neutral-800"
              >
                Uložit vozidlo
              </button>
            </div>

          </form>

        </div>
      </div>
    </main>
  );
}