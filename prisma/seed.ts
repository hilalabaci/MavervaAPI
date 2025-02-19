// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   const project = await prisma.project.create({
//     data: {
//       Name: "Maverva Project",
//       Boards: {
//         create: [
//           {
//             Name: "Scrum Board",
//             Key: "unique-key", // Pass Key here for the Board
//             LeadUserId: "lead-user-id", // Pass LeadUserId here for the Board
//             Backlog: { create: {} }, // Create a backlog for the board
//             Sprints: {
//               create: [
//                 { Name: "Sprint 1", IsActive: true },
//                 { Name: "Sprint 2", IsActive: false },
//               ],
//             },
//             Columns: {
//               create: [
//                 { Name: "To Do", Status: 1 },
//                 { Name: "In Progress", Status: 2 },
//                 { Name: "Done", Status: 99 },
//               ],
//             },
//           },
//         ],
//       },
//     },
//   });
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
