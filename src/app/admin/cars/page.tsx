import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminCarCard from "@/components/admin-car-card";
import AdminCarsToolbar from "@/components/admin-cars-toolbar";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/prihlaseni?callbackUrl=/admin/cars");
  }

  if (!["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const cars = await prisma.carModel.findMany({
    include: {
      variants: {
        include: {
          blocked: {
            orderBy: {
              dateFrom: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "asc",
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
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Vozidla
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          Správa modelů, variant, cen, obrázků, blokací a dostupných kusů.
        </p>

        <div className="mt-6">
          <AdminCarsToolbar />
        </div>

        <div className="mt-8 space-y-6">
          {cars.length === 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              Žádná vozidla.
            </div>
          )}

          {cars.map((car) => (
            <AdminCarCard
              key={car.id}
              currentUserRole={session.user.role}
              car={{
                id: car.id,
                brand: car.brand,
                model: car.model,
                slug: car.slug,
                active: car.active,
                variants: car.variants.map((variant) => ({
                  id: variant.id,
                  name: variant.name,
                  transmission: variant.transmission,
                  fuel: variant.fuel,
                  seats: variant.seats,
                  pricePerDayShort: variant.pricePerDayShort,
                  pricePerDayLong: variant.pricePerDayLong,
                  quantity: variant.quantity,
                  image: variant.image,
                  active: variant.active,
                  blocked: variant.blocked.map((block) => ({
                    id: block.id,
                    dateFrom: block.dateFrom.toISOString(),
                    dateTo: block.dateTo.toISOString(),
                    reason: block.reason,
                  })),
                })),
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}