import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  sendEmail,
  reservationReceivedTemplate,
  adminNewReservationTemplate,
} from "@/lib/email";

const reservationSchema = z.object({
  carVariantId: z.string().min(1),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
});

function countDays(dateFrom: Date, dateTo: Date) {
  const diff = dateTo.getTime() - dateFrom.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro rezervaci se musíte přihlásit." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Neplatná data formuláře.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Uživatel nebyl nalezen." },
        { status: 404 }
      );
    }

    if (
      !user.firstName ||
      !user.lastName ||
      !user.phone ||
      !user.dateOfBirth ||
      !user.addressStreet ||
      !user.addressCity ||
      !user.addressZip ||
      !user.idDocumentNumber ||
      !user.driverLicenseNumber ||
      !user.driverLicenseExpiry
    ) {
      return NextResponse.json(
        {
          error: "Nejdříve doplňte svůj profil řidiče v sekci Moje údaje.",
        },
        { status: 400 }
      );
    }

    const { carVariantId } = parsed.data;
    const dateFrom = new Date(parsed.data.dateFrom);
    const dateTo = new Date(parsed.data.dateTo);

    if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
      return NextResponse.json(
        { error: "Neplatné datum." },
        { status: 400 }
      );
    }

    if (dateFrom >= dateTo) {
      return NextResponse.json(
        { error: "Datum vrácení musí být později než datum převzetí." },
        { status: 400 }
      );
    }

    const variant = await prisma.carVariant.findUnique({
      where: { id: carVariantId },
      include: {
        carModel: true,
        reservations: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            dateFrom: { lt: dateTo },
            dateTo: { gt: dateFrom },
          },
        },
        blocked: {
          where: {
            dateFrom: { lt: dateTo },
            dateTo: { gt: dateFrom },
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Vybrané vozidlo nebylo nalezeno." },
        { status: 404 }
      );
    }

    if (!variant.carModel.active) {
      return NextResponse.json(
        { error: "Vybrané vozidlo není dostupné." },
        { status: 404 }
      );
    }

    if (variant.blocked.length > 0) {
      return NextResponse.json(
        { error: "Vozidlo je v tomto termínu blokované." },
        { status: 400 }
      );
    }

    if (variant.reservations.length >= variant.quantity) {
      return NextResponse.json(
        { error: "Vozidlo už není v tomto termínu dostupné." },
        { status: 400 }
      );
    }

    const rentalDays = countDays(dateFrom, dateTo);
   const pricePerDay =
  rentalDays >= 8
    ? variant.pricePerDayLong
    : variant.pricePerDayShort;

const totalPrice = rentalDays * pricePerDay;

    const customerName = `${user.firstName} ${user.lastName}`.trim();
    const email = user.email;
    const phone = user.phone;

    const reservation = await prisma.reservation.create({
      data: {
        carVariantId,
        userId: user.id,
        dateFrom,
        dateTo,
        customerName,
        email,
        phone,
        totalPrice,
        status: "PENDING",
      },
    });

    const carName = `${variant.carModel.brand} ${variant.carModel.model} – ${variant.name}`;
    const formattedDateFrom = dateFrom.toLocaleDateString("cs-CZ");
    const formattedDateTo = dateTo.toLocaleDateString("cs-CZ");

    await sendEmail({
      to: email,
      subject: "Rezervace přijata – OKIM GO",
      html: reservationReceivedTemplate({
        customerName,
        carName,
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
        totalPrice,
      }),
    });

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: "Nová rezervace – OKIM GO",
        html: adminNewReservationTemplate({
          customerName,
          email,
          phone,
          carName,
          dateFrom: formattedDateFrom,
          dateTo: formattedDateTo,
          totalPrice,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      totalPrice,
    });
  } catch (error) {
    console.error("RESERVATION_API_ERROR", error);

    return NextResponse.json(
      { error: "Chyba serveru při ukládání rezervace." },
      { status: 500 }
    );
  }
}