// Prisma Interactive Transaction 래퍼 (미구현 스텁)
// withTransaction() 함수 시그니처만 정의됨.

import { PrismaClient } from '@prisma/client';

// 미구현 스텁
export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: PrismaClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number },
): Promise<T> {
  throw new Error('Not implemented');
}
