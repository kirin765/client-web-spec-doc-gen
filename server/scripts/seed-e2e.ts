import { PrismaClient } from '@prisma/client';
import { seedE2ETestData } from '../test/e2e-test-data';

async function main() {
  const prisma = new PrismaClient();

  try {
    await seedE2ETestData(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
