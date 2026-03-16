import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AccountDetailsForm from "@/components/account-details-form";

export const dynamic = "force-dynamic";

function formatDateForInput(value?: Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

export default async function AccountDetailsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/prihlaseni?callbackUrl=/ucet/udaje");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">Moje údaje</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Doplňte údaje potřebné pro autopůjčovnu a předání vozidla.
        </p>

        <div className="mt-8">
          <AccountDetailsForm
            initialValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              dateOfBirth: formatDateForInput(user.dateOfBirth),
              addressStreet: user.addressStreet,
              addressCity: user.addressCity,
              addressZip: user.addressZip,
              idDocumentNumber: user.idDocumentNumber,
              driverLicenseNumber: user.driverLicenseNumber,
              driverLicenseExpiry: formatDateForInput(user.driverLicenseExpiry),
            }}
          />
        </div>
      </div>
    </main>
  );
}