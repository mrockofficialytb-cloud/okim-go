import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail, rentalContractTemplate } from "@/lib/email";
import { generateRentalContractPdf } from "@/lib/rental-contract-pdf";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const schema = z.object({
  type: z.enum(["pickup", "return"]),
  mileage: z.coerce.number().int().min(0),
  fuel: z.string().min(1),
  note: z.string().optional().nullable(),
  signatureOwner: z.string().optional().nullable(),
  signatureCustomer: z.string().optional().nullable(),
});

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data formuláře." },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Rezervace nebyla nalezena." },
        { status: 404 }
      );
    }

    const {
      type,
      mileage,
      fuel,
      note,
      signatureOwner,
      signatureCustomer,
    } = parsed.data;

    if (type === "pickup") {
      if (reservation.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "Předání lze provést pouze u schválené rezervace." },
          { status: 400 }
        );
      }

      if (!signatureOwner || !signatureCustomer) {
        return NextResponse.json(
          { error: "Před potvrzením předání musí být oba podpisy vyplněny." },
          { status: 400 }
        );
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: {
          status: "PICKED_UP",
          pickupAt: new Date(),
          pickupMileage: mileage,
          pickupFuel: fuel,
          pickupNote: note?.trim() || null,
          pickupOwnerSignature: signatureOwner,
          pickupCustomerSignature: signatureCustomer,
          pickupOwnerSignedAt: new Date(),
          pickupCustomerSignedAt: new Date(),
        },
        include: {
          user: true,
          carVariant: {
            include: {
              carModel: true,
            },
          },
        },
      });

      let emailWarning = false;

      try {
        const pdf = await generateRentalContractPdf({
          id: updated.id,
          customerName: updated.customerName,
          email: updated.email,
          phone: updated.phone,
          totalPrice: updated.totalPrice,
          depositAmount: updated.depositAmount,
          dateFrom: updated.dateFrom,
          dateTo: updated.dateTo,
          createdAt: updated.createdAt,
          pickupAt: updated.pickupAt,
          pickupMileage: updated.pickupMileage,
          pickupFuel: updated.pickupFuel,
          pickupNote: updated.pickupNote,
          pickupOwnerSignature: updated.pickupOwnerSignature,
          pickupCustomerSignature: updated.pickupCustomerSignature,
          car: {
            brand: updated.carVariant.carModel.brand,
            model: updated.carVariant.carModel.model,
            variant: updated.carVariant.name,
          },
          user: updated.user
            ? {
                firstName: updated.user.firstName,
                lastName: updated.user.lastName,
                dateOfBirth: updated.user.dateOfBirth,
                addressStreet: updated.user.addressStreet,
                addressCity: updated.user.addressCity,
                addressZip: updated.user.addressZip,
                idDocumentNumber: updated.user.idDocumentNumber,
                driverLicenseNumber: updated.user.driverLicenseNumber,
                driverLicenseExpiry: updated.user.driverLicenseExpiry,
              }
            : null,
        });

        const carName = `${updated.carVariant.carModel.brand} ${updated.carVariant.carModel.model} – ${updated.carVariant.name}`;
        const dateFrom = new Date(updated.dateFrom).toLocaleDateString("cs-CZ");
        const dateTo = new Date(updated.dateTo).toLocaleDateString("cs-CZ");
        const pickupAt = updated.pickupAt
          ? new Date(updated.pickupAt).toLocaleString("cs-CZ")
          : "—";

        await sendEmail({
          to: updated.email,
          subject: "OKIM GO – podepsaná nájemní smlouva",
          html: rentalContractTemplate({
            customerName: updated.customerName,
            carName,
            dateFrom,
            dateTo,
            pickupAt,
            pickupMileage: updated.pickupMileage ?? 0,
            pickupFuel: updated.pickupFuel || "—",
          }),
          attachments: [
            {
              filename: `smlouva-${updated.id}.pdf`,
              content: Buffer.from(pdf),
              contentType: "application/pdf",
            },
          ],
        });
      } catch (err) {
        console.error("EMAIL_RENTAL_CONTRACT_ERROR", err);
        emailWarning = true;
      }

      return NextResponse.json({
        success: true,
        reservation: updated,
        emailWarning,
      });
    }

    if (type === "return") {
      if (reservation.status !== "PICKED_UP") {
        return NextResponse.json(
          { error: "Vrácení lze provést pouze u půjčené rezervace." },
          { status: 400 }
        );
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: {
          status: "RETURNED",
          returnAt: new Date(),
          returnMileage: mileage,
          returnFuel: fuel,
          returnNote: note?.trim() || null,
        },
      });

      return NextResponse.json({ success: true, reservation: updated });
    }

    return NextResponse.json({ error: "Neplatná operace." }, { status: 400 });
  } catch (error) {
    console.error("ADMIN_RESERVATION_HANDOVER_ERROR", error);

    return NextResponse.json(
      { error: "Uložení předání/vrácení se nepodařilo." },
      { status: 500 }
    );
  }
}