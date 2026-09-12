import { PrismaClient } from "@prisma/client";
import { initialAppointments } from "../lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  await prisma.appointment.deleteMany({});

  for (const item of initialAppointments) {
    await prisma.appointment.create({
      data: {
        title: item.title,
        description: item.description,
        date: new Date(item.date),
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
      },
    });
  }

  console.log(`Seeded ${initialAppointments.length} sample appointments into database.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
