import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@logbook.app" },
    update: {},
    create: {
      name: "Ada Lovelace",
      email: "demo@logbook.app",
      emailVerified: true,
      timezone: "UTC",
    },
  });

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const launchTask = await prisma.task.create({
    data: {
      userId: user.id,
      title: "Ship Log Book Phase 3",
      completed: false,
      level: "DAY",
      periodKey: todayStr,
      scheduledDate: todayStr,
      estimatedMinutes: 240,
      order: 0,
      subtasks: {
        create: [
          { title: "Design enums", completed: true, order: 0 },
          { title: "Design relations", completed: true, order: 1 },
          { title: "Write seed script", completed: false, order: 2 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: "Read Designing Data-Intensive Applications",
      completed: false,
      level: "DAY",
      periodKey: todayStr,
      estimatedMinutes: 60,
      order: 1,
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      title: "Write unit tests for task service",
      completed: false,
      level: "WEEK",
      periodKey: `${todayStr.slice(0, 4)}-W${getIsoWeek(today).toString().padStart(2, "0")}`,
      order: 0,
    },
  });

  console.log("✅ Seed complete. Demo user:", user.email, "| Launch task:", launchTask.id);
}

function getIsoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });