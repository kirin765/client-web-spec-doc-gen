import type { DeveloperCareerLevel } from '../../types/developer';

export function getCareerLevel(totalCareerYears: number | null | undefined): DeveloperCareerLevel | null {
  if (!Number.isFinite(totalCareerYears) || totalCareerYears == null || totalCareerYears <= 0) {
    return null;
  }

  if (totalCareerYears <= 3) {
    return 'newcomer';
  }

  if (totalCareerYears <= 9) {
    return 'senior';
  }

  return 'veteran';
}
