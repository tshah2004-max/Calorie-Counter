const { ACTIVITY_LEVELS } = require("../config/activityLevels");
const { calcAge }         = require("./dateUtils");

function calcBMR({ weightKg, heightCm, dateOfBirth, gender }) {
  const age  = calcAge(dateOfBirth);
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const offsets = { male: 5, female: -161, other: -78 };
  return Math.round(base + (offsets[gender] ?? -78));
}

function calcTDEE(user) {
  const mult = ACTIVITY_LEVELS[user.activityLevel]?.multiplier ?? 1.55;
  return Math.round(calcBMR(user) * mult);
}

function calcCalorieGoal(user) {
  const deltas = { lose: -500, maintain: 0, gain: 300 };
  return Math.max(1200, calcTDEE(user) + (deltas[user.weightGoal] ?? 0));
}

function buildDefaultGoals(user) {
  const calories = calcCalorieGoal(user);
  return {
    calories,
    protein:  Math.round(user.weightKg * 1.8),
    carbs:    Math.round((calories * 0.45) / 4),
    fat:      Math.round((calories * 0.30) / 9),
    fibre:    30,
    water:    2500,
  };
}

function summariseLog(entries) {
  const t = { calories:0, protein:0, carbs:0, fat:0, fibre:0, sugar:0 };
  for (const e of entries) {
    const r = e.quantityG / (e.food.servingSize || 100);
    for (const k of Object.keys(t)) t[k] += (e.food[k] || 0) * r;
  }
  return Object.fromEntries(Object.entries(t).map(([k,v]) => [k, Math.round(v*10)/10]));
}

function calcEntryNutrition(food, quantityG) {
  const r = quantityG / (food.servingSize || 100);
  return {
    calories: Math.round(food.calories          * r * 10) / 10,
    protein:  Math.round((food.protein  || 0)   * r * 10) / 10,
    carbs:    Math.round((food.carbs    || 0)   * r * 10) / 10,
    fat:      Math.round((food.fat      || 0)   * r * 10) / 10,
  };
}

module.exports = { calcBMR, calcTDEE, calcCalorieGoal, buildDefaultGoals, summariseLog, calcEntryNutrition };
