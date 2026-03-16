import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nemáte oprávnění." }, { status: 403 });
  }

  const latestReservation = await prisma.reservation.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      carVariant: {
        include: {
          carModel: true,
        },
      },
    },
  });

  if (!latestReservation) {
    return NextResponse.json({
      latestId: null,
      createdAt: null,
      customerName: null,
      carName: null,
    });
  }

  return NextResponse.json({
    latestId: latestReservation.id,
    createdAt: latestReservation.createdAt,
    customerName: latestReservation.customerName,
    carName: `${latestReservation.carVariant.carModel.brand} ${latestReservation.carVariant.carModel.model} – ${latestReservation.carVariant.name}`,
  });
}