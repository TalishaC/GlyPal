// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULT = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULT;

/**
 * Calculate BMR using Mifflin-St Jeor formula
 * BMR = 10*kg + 6.25*cm - 5*age + s
 * where s = +5 for male, -161 for female
 */
export function mifflinStJeor({
  sexAtBirth,
  kg,
  cm,
  age,
}: {
  sexAtBirth: string;
  kg: number;
  cm: number;
  age: number;
}): number {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  const sexAdjustment = sexAtBirth === "Male" ? 5 : -161;
  return Math.round(base + sexAdjustment);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR * activity_multiplier
 */
export function tdee(bmr: number, activityLevel: ActivityLevel | string): number {
  const multiplier = ACTIVITY_MULT[activityLevel as ActivityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Adjust TDEE based on goal (lose/maintain/gain weight)
 * - lose: reduce by pct (e.g., 15% = 0.15)
 * - gain: increase by pct (e.g., 10% = 0.10)
 * - maintain: no change
 */
export function adjustByGoal(
  tdeeValue: number,
  goal: string,
  pct: number
): number {
  if (goal === "lose") {
    return Math.round(tdeeValue * (1 - pct));
  }
  if (goal === "gain") {
    return Math.round(tdeeValue * (1 + pct));
  }
  return tdeeValue; // maintain
}

/**
 * Convert imperial to metric
 */
export function convertToMetric({
  units,
  heightFt,
  heightIn,
  heightCm,
  weightLb,
  weightKg,
}: {
  units: string;
  heightFt?: number;
  heightIn?: number;
  heightCm?: number;
  weightLb?: number;
  weightKg?: number;
}): { kg: number; cm: number } {
  if (units === "imperial") {
    const totalInches = (heightFt ?? 0) * 12 + (heightIn ?? 0);
    const cm = totalInches * 2.54;
    const kg = (weightLb ?? 0) * 0.453592;
    return { kg, cm };
  }
  // metric
  return {
    kg: weightKg ?? 0,
    cm: heightCm ?? 0,
  };
}
