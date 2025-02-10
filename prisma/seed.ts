import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.create({
    data: {
      name: "Maverva Project",
      boards: {
        create: [
          {
            name: "Scrum Board",
            backlog: { create: {} }, // Board için bir backlog oluştur
            sprints: {
              create: [
                { name: "Sprint 1", isActive: true }, // Aktif sprint
                { name: "Sprint 2", isActive: false }, // Gelecek sprint
              ],
            },
            columns: {
              create: [
                { name: "To Do" },
                { name: "In Progress" },
                { name: "Done" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Project and Scrum Board initialized:", project);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
