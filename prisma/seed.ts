import { ApplicationStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const passwordHash = await hash("Password123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@prepflow.dev" },
    update: {},
    create: {
      name: "Demo Candidate",
      email: "demo@prepflow.dev",
      passwordHash,
    },
  });

  await prisma.jobApplication.createMany({
    data: [
      {
        userId: user.id,
        company: "Notion",
        roleTitle: "Product Engineer",
        location: "San Francisco, CA",
        status: ApplicationStatus.INTERVIEW,
      },
      {
        userId: user.id,
        company: "Ramp",
        roleTitle: "Frontend Engineer",
        location: "New York, NY",
        status: ApplicationStatus.APPLIED,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete.");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
