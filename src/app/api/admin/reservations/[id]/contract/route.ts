import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateRentalContractPdf } from "@/lib/rental-contract-pdf";

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

  if (!reservation.pickupAt) {
    return new NextResponse("Contract is available after pickup only", {
      status: 400,
    });
  }

  const pdfBytes = await generateRentalContractPdf({
    id: reservation.id,
    customerName: reservation.customerName,
    email: reservation.email,
    phone: reservation.phone,
    totalPrice: reservation.totalPrice,
    depositAmount: reservation.depositAmount,
    dateFrom: reservation.dateFrom,
    dateTo: reservation.dateTo,
    createdAt: reservation.createdAt,
    pickupAt: reservation.pickupAt,
    pickupMileage: reservation.pickupMileage,
    pickupFuel: reservation.pickupFuel,
    pickupNote: reservation.pickupNote,
    pickupOwnerSignature: reservation.pickupOwnerSignature,
    pickupCustomerSignature: reservation.pickupCustomerSignature,
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
      "Content-Disposition": `inline; filename="smlouva-${reservation.id}.pdf"`,
    },
  });
}