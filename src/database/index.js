import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // optional: enables query logging
});

module.exports = prisma;
