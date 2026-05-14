import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("20082008o", 12);

  // Admin only
  await prisma.user.upsert({
    where: { email: "admin" },
    update: {},
    create: {
      name: "Admin",
      surname: "CodeLearn",
      email: "admin",
      password: adminPassword,
      role: "ADMIN",
      city: "Tashkent",
      level: 3,
      points: 0,
      language: "RU",
    },
  });

  console.log("Seed completed!");
  console.log("Admin: admin / 20082008o");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
