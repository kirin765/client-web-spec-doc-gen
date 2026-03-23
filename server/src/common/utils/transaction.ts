// [수정 필요 - L7] tx as unknown as PrismaClient 캐스팅이 잘못됨
// - $transaction 콜백의 tx는 제한된 트랜잭션 클라이언트이며, 전체 PrismaClient가 아님
// - PrismaClient로 캐스팅하면 $connect, $disconnect 등 사용 불가 메서드가 타입상 노출됨
// - fn 파라미터 타입과 캐스팅을 Prisma.TransactionClient로 변경해야 함
// - import { Prisma } from '@prisma/client' 후 Prisma.TransactionClient 사용

import { PrismaClient } from '@prisma/client';

export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: PrismaClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number },
): Promise<T> {
  // options는 현재 무시되지만 API에 남겨두어 향후 확장 가능
  return prisma.$transaction(async (tx) => {
    return fn(tx as unknown as PrismaClient);
  });
}
