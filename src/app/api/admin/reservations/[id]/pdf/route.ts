import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateReservationPdf } from "@/lib/reservation-pdf";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: Request, { params }: Props) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

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
    return new NextResponse("Reservation not found", { status: 404 });
  }

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
    pickupTimePlanned: reservation.pickupTimePlanned,
    returnTimePlanned: reservation.returnTimePlanned,
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

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="rezervace-${reservation.id}.pdf"`,
    },
  });
}