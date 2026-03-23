// [참고 - C8, C9] 이 유틸리티가 존재하지만 실제 서비스에서 사용되지 않음
// - matching.service.ts에서 enum 비교 시 대소문자 불일치 문제가 있으며, 이 함수들을 import하여 사용해야 함
// - admin.service.ts에서도 enum 변환 시 이 유틸리티를 활용해야 함
// - 각 서비스에서 normalizeEnumFromApi/normalizeEnumToApi를 import하여 enum 변환에 사용할 것

/**
 * Prisma UPPERCASE enum → API lowercase 변환
 * 예: AVAILABLE → available, HIGH_PRIORITY → high_priority
 */
export function normalizeEnumToApi(enumValue: string | null | undefined): string {
  if (!enumValue) return '';
  return enumValue.toLowerCase();
}

/**
 * API lowercase → Prisma UPPERCASE enum 변환
 * 예: available → AVAILABLE, high_priority → HIGH_PRIORITY
 */
export function normalizeEnumFromApi(apiValue: string | null | undefined): string {
  if (!apiValue) return '';
  return apiValue.toUpperCase();
}

/**
 * 여러 enum 배열을 API 형식으로 변환
 * 예: ['ACTIVE', 'PENDING'] → ['active', 'pending']
 */
export function normalizeEnumsToApi(enumValues: (string | null | undefined)[]): string[] {
  return enumValues.filter(Boolean).map((v) => normalizeEnumToApi(v));
}

/**
 * API 형식의 여러 enum을 Prisma 형식으로 변환
 * 예: ['active', 'pending'] → ['ACTIVE', 'PENDING']
 */
export function normalizeEnumsFromApi(apiValues: (string | null | undefined)[]): string[] {
  return apiValues.filter(Boolean).map((v) => normalizeEnumFromApi(v));
}

