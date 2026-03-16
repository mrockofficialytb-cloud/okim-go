import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "mrockuw@seznam.cz"; // změň když chceš jiný admin email
  const name = "Václav Šlepr";
  const plainPassword = "Admin123456!";

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("ADMIN HOTOVO");
  console.log("EMAIL:", user.email);
  console.log("HESLO:", plainPassword);
  console.log("ROLE:", user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });