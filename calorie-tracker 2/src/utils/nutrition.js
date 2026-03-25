/**
 * Nutrition calculation utilities — Mifflin-St Jeor equations
 */

const {
  ACTIVITY_MULTIPLIERS, GOAL_CALORIE_DELTA, MIN_CALORIES,
  PROTEIN_PER_KG, CARB_RATIO, FAT_RATIO,
  DEFAULT_WATER_GOAL, DEFAULT_FIBRE_GOAL,
} = require("../config/constants");

/**
 * Calculate age in full years from a YYYY-MM-DD date-of-birth string
 */
function calcAge(dob) {
  const birth = new Date(dob);
  const now   = new Date();
  let age     = now.getFullYear() - birth.getFullYear();
  const m     = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Basal Metabolic Rate — Mifflin-St Jeor
 */
function calcBMR({ weightKg, heightCm, dateOfBirth, gender }) {
  const age  = calcAge(dateOfBirth);
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "male")   return Math.round(base + 5);
  if (gender === "female") return Math.round(base - 161);
  return Math.round(base - 78); // other / non-binary
}

/**
 * Total Daily Energy Expenditure
 */
function calcTDEE(user) {
  const mult = ACTIVITY_MULTIPLIERS[user.activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(calcBMR(user) * mult);
}

/**
 * Recommended calorie goal adjusted for weight goal (lose / maintain / gain)
 */
function calcCalorieGoal(user) {
  const delta = GOAL_CALORIE_DELTA[user.weightGoal] ?? 0;
  return Math.max(MIN_CALORIES, calcTDEE(user) + delta);
}

/**
 * Full set of default macro goals derived from body stats
 */
function calcDefaultGoals(user) {
  const calories = calcCalorieGoal(user);
  return {
    calories,
    protein: Math.round(user.weightKg * PROTEIN_PER_KG),
    carbs:   Math.round((calories * CARB_RATIO) / 4),
    fat:     Math.round((calories * FAT_RATIO)  / 9),
    fibre:   DEFAULT_FIBRE_GOAL,
    water:   DEFAULT_WATER_GOAL,
  };
}

/**
 * Sum all macros across an array of diary entries
 */
function summariseLog(entries) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, sugar: 0 };
  for (const entry of entries) {
    const ratio = entry.quantityG / (entry.food.servingSize || 100);
    for (const macro of Object.keys(totals)) {
      totals[macro] += (entry.food[macro] || 0) * ratio;
    }
  }
  return Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, Math.round(v * 10) / 10])
  );
}

/**
 * Calculate macros for a single entry given quantity in grams
 */
function calcEntryNutrition(food, quantityG) {
  const ratio = quantityG / (food.servingSize || 100);
  return {
    calories: Math.round(food.calories          * ratio * 10) / 10,
    protein:  Math.round((food.protein  || 0)   * ratio * 10) / 10,
    carbs:    Math.round((food.carbs    || 0)   * ratio * 10) / 10,
    fat:      Math.round((food.fat      || 0)   * ratio * 10) / 10,
  };
}

module.exports = {
  calcAge, calcBMR, calcTDEE, calcCalorieGoal,
  calcDefaultGoals, summariseLog, calcEntryNutrition,
};
