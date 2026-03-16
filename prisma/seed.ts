import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.blockedPeriod.deleteMany();
  await prisma.carVariant.deleteMany();
  await prisma.carModel.deleteMany();

  await prisma.carModel.create({
    data: {
      slug: "skoda-fabia",
      brand: "Škoda",
      model: "Fabia",
      image: "/cars/fabia.jpg",
      active: true,
      variants: {
        create: [
          {
            name: "1.0 TSI Manuál",
            transmission: "Manuál",
            fuel: "Benzín",
            seats: 5,
            pricePerDayShort: 890,
pricePerDayLong: 790,
            quantity: 1,
          },
          {
            name: "1.0 TSI Automat",
            transmission: "Automat",
            fuel: "Benzín",
            seats: 5,
            pricePerDayShort: 890,
pricePerDayLong: 790,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.carModel.create({
    data: {
      slug: "skoda-octavia",
      brand: "Škoda",
      model: "Octavia",
      image: "/cars/octavia.jpg",
      active: true,
      variants: {
        create: [
          {
            name: "2.0 TDI Automat",
            transmission: "Automat",
            fuel: "Nafta",
            seats: 5,
            pricePerDayShort: 890,
pricePerDayLong: 790,
            quantity: 2,
          },
        ],
      },
    },
  });

  await prisma.carModel.create({
    data: {
      slug: "vw-golf",
      brand: "Volkswagen",
      model: "Golf",
      image: "/cars/golf.jpg",
      active: true,
      variants: {
        create: [
          {
            name: "1.5 TSI Automat",
            transmission: "Automat",
            fuel: "Benzín",
            seats: 5,
            pricePerDayShort: 890,
pricePerDayLong: 790,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.carModel.create({
    data: {
      slug: "vw-multivan",
      brand: "Volkswagen",
      model: "Multivan",
      image: "/cars/multivan.jpg",
      active: true,
      variants: {
        create: [
          {
            name: "2.0 TDI DSG",
            transmission: "Automat",
            fuel: "Nafta",
            seats: 7,
           pricePerDayShort: 890,
pricePerDayLong: 790,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log("Seed hotový.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });