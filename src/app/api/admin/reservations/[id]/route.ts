import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  sendEmail,
  reservationConfirmedTemplate,
  reservationCanceledTemplate,
} from "@/lib/email";
import { generateReservationPdf } from "@/lib/reservation-pdf";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["CONFIRMED", "PICKED_UP", "RETURNED", "CANCELED"].includes(status)) {
      return NextResponse.json({ error: "Neplatný status." }, { status: 400 });
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status,
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

    const carName = `${reservation.carVariant.carModel.brand} ${reservation.carVariant.carModel.model} – ${reservation.carVariant.name}`;
    const formattedDateFrom = new Date(reservation.dateFrom).toLocaleDateString("cs-CZ");
    const formattedDateTo = new Date(reservation.dateTo).toLocaleDateString("cs-CZ");

    if (status === "CONFIRMED") {
      const pdfBytes = await generateReservationPdf({
        id: reservation.id,
        customerName: reservation.customerName,
        email: reservation.email,
        phone: reservation.phone,
        totalPrice: reservation.totalPrice,
        depositAmount: reservation.depositAmount,
        dateFrom: reservation.dateFrom,
        dateTo: reservation.dateTo,
        createdAt: reservation.createdAt,
        car: {
          brand: reservation.carVariant.carModel.brand,
          model: reservation.carVariant.carModel.model,
          variant: reservation.carVariant.name,
        },
        user: reservation.user
          ? {
              firstName: reservation.user.firstName,
              lastName: reservation.user.lastName,
              dateOfBirth: reservation.user.dateOfBirth,
              addressStreet: reservation.user.addressStreet,
              addressCity: reservation.user.addressCity,
              addressZip: reservation.user.addressZip,
              idDocumentNumber: reservation.user.idDocumentNumber,
              driverLicenseNumber: reservation.user.driverLicenseNumber,
              driverLicenseExpiry: reservation.user.driverLicenseExpiry,
            }
          : null,
      });

      await sendEmail({
        to: reservation.email,
        subject: "Rezervace potvrzena – OKIM GO",
        html: reservationConfirmedTemplate({
          customerName: reservation.customerName,
          carName,
          dateFrom: formattedDateFrom,
          dateTo: formattedDateTo,
          totalPrice: reservation.totalPrice,
        }),
        attachments: [
          {
            filename: `potvrzeni-rezervace-${reservation.id}.pdf`,
            content: Buffer.from(pdfBytes),
            contentType: "application/pdf",
          },
        ],
      });
    }

    if (status === "CANCELED") {
      await sendEmail({
        to: reservation.email,
        subject: "Rezervace byla zrušena – OKIM GO",
        html: reservationCanceledTemplate({
          customerName: reservation.customerName,
          carName,
          dateFrom: formattedDateFrom,
          dateTo: formattedDateTo,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error("ADMIN_RESERVATION_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Změnu stavu se nepodařilo uložit." },
      { status: 500 }
    );
  }
}