import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  reservationConfirmedTemplate,
  reservationCanceledTemplate,
} from "@/lib/email";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nemáte oprávnění." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["CONFIRMED", "CANCELED"].includes(status)) {
      return NextResponse.json(
        { error: "Neplatný status." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status,
      },
      include: {
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