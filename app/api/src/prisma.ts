import { PrismaClient } from "./generated/prisma/client";
// Global variable to prevent multiple instances in development (for hot-reloading)
// const globalForPrisma = global as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient({
//     log: ['query', 'info', 'warn', 'error'], // Optional: configure logging
//   });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }


const prisma = new PrismaClient();

export default prisma;