import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, returnReminderTemplate } from "@/lib/email";

function startOfTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized cron access." }, { status: 401 });
  }

  try {
    const dateFrom = startOfTomorrow();
    const dateTo = endOfTomorrow();

    const reservations = await prisma.reservation.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PICKED_UP"],
        },
        dateTo: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        carVariant: {
          include: {
            carModel: true,
          },
        },
      },
    });

    let sent = 0;

    for (const reservation of reservations) {
      const carName = `${reservation.carVariant.carModel.brand} ${reservation.carVariant.carModel.model} – ${reservation.carVariant.name}`;

      await sendEmail({
        to: reservation.email,
        subject: "OKIM GO – připomínka vrácení vozidla",
        html: returnReminderTemplate({
          customerName: reservation.customerName,
          carName,
          dateTo: new Date(reservation.dateTo).toLocaleDateString("cs-CZ"),
        }),
      });

      sent += 1;
    }

    return NextResponse.json({
      success: true,
      sent,
    });
  } catch (error) {
    console.error("CRON_RETURN_REMINDERS_ERROR", error);

    return NextResponse.json(
      { error: "Odeslání reminderů selhalo." },
      { status: 500 }
    );
  }
}