import { prisma } from "@/lib/prisma";

export async function getAvailableCars(dateFrom: Date, dateTo: Date) {
  const variants = await prisma.carVariant.findMany({
    where: {
      active: true,
      carModel: {
        active: true,
      },
    },
    select: {
      id: true,
      name: true,
      transmission: true,
      fuel: true,
      seats: true,
      quantity: true,
      pricePerDayShort: true,
      pricePerDayLong: true,
      image: true,
      reservations: {
        select: {
          status: true,
          dateFrom: true,
          dateTo: true,
        },
      },
      blocked: {
        select: {
          dateFrom: true,
          dateTo: true,
        },
      },
      carModel: {
        select: {
          id: true,
          brand: true,
          model: true,
          slug: true,
        },
      },
    },
  });

  return variants.filter((variant) => {
    const overlappingReservations = variant.reservations.filter(
      (r) =>
        r.status !== "CANCELED" &&
        r.dateFrom < dateTo &&
        r.dateTo > dateFrom
    ).length;

    const overlappingBlocks = variant.blocked.filter(
      (b) => b.dateFrom < dateTo && b.dateTo > dateFrom
    ).length;

    return (
      overlappingBlocks === 0 &&
      overlappingReservations < variant.quantity
    );
  });
}