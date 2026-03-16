import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  reservationCanceledTemplate,
  adminNewReservationTemplate,
} from "@/lib/email";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_req: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Musíte být přihlášen." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
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

    if (!["PENDING", "CONFIRMED"].includes(reservation.status)) {
      return NextResponse.json(
        { error: "Tuto rezervaci již nelze zrušit." },
        { status: 400 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CANCELED",
      },
      include: {
        carVariant: {
          include: {
            carModel: true,
          },
        },
      },
    });

    const carName = `${updatedReservation.carVariant.carModel.brand} ${updatedReservation.carVariant.carModel.model} – ${updatedReservation.carVariant.name}`;
    const formattedDateFrom = new Date(updatedReservation.dateFrom).toLocaleDateString("cs-CZ");
    const formattedDateTo = new Date(updatedReservation.dateTo).toLocaleDateString("cs-CZ");

    await sendEmail({
      to: updatedReservation.email,
      subject: "Rezervace byla zrušena – OKIM GO",
      html: reservationCanceledTemplate({
        customerName: updatedReservation.customerName,
        carName,
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
      }),
    });

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: "Zákazník zrušil rezervaci – OKIM GO",
        html: adminNewReservationTemplate({
          customerName: updatedReservation.customerName,
          email: updatedReservation.email,
          phone: updatedReservation.phone,
          carName,
          dateFrom: formattedDateFrom,
          dateTo: formattedDateTo,
          totalPrice: updatedReservation.totalPrice,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("MY_RESERVATION_CANCEL_ERROR", error);

    return NextResponse.json(
      { error: "Rezervaci se nepodařilo zrušit." },
      { status: 500 }
    );
  }
}