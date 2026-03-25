/**
 * In-memory database + seed data
 *
 * In production replace with a real DB (PostgreSQL, MongoDB, etc.)
 * Swap out this file and keep all other code the same.
 */

// NOTE: uuid is a runtime dependency — install with: npm install uuid
// Using a simple fallback in case uuid isn't available yet
let uuidv4;
try {
  uuidv4 = require("uuid").v4;
} catch {
  let counter = 0;
  uuidv4 = () => `id-${Date.now()}-${++counter}`;
}

const db = {
  users:    {},  // { [userId]:  UserObject }
  sessions: {},  // { [token]:   userId }
  foodLogs: {},  // { [userId]:  { [YYYY-MM-DD]: [FoodEntry] } }
  goals:    {},  // { [userId]:  GoalObject }
  water:    {},  // { [userId]:  { [YYYY-MM-DD]: totalMl } }
  weight:   {},  // { [userId]:  [{ date, kg, loggedAt }] }
  foodDB:   {},  // { [foodId]:  FoodItem }
};

// ─────────────────────────────────────────────
//  Seed Data
// ─────────────────────────────────────────────
const SEED_FOODS = [
  // Fruit
  { name: "Apple (medium)",          calories: 95,  protein: 0.5, carbs: 25,  fat: 0.3,  fibre: 4.4, sugar: 19,  category: "Fruit",      servingSize: 182, servingUnit: "g" },
  { name: "Banana (medium)",         calories: 105, protein: 1.3, carbs: 27,  fat: 0.4,  fibre: 3.1, sugar: 14,  category: "Fruit",      servingSize: 118, servingUnit: "g" },
  { name: "Orange (medium)",         calories: 62,  protein: 1.2, carbs: 15,  fat: 0.2,  fibre: 3.1, sugar: 12,  category: "Fruit",      servingSize: 131, servingUnit: "g" },
  { name: "Strawberries (100g)",     calories: 32,  protein: 0.7, carbs: 7.7, fat: 0.3,  fibre: 2.0, sugar: 4.9, category: "Fruit",      servingSize: 100, servingUnit: "g" },
  { name: "Blueberries (100g)",      calories: 57,  protein: 0.7, carbs: 14,  fat: 0.3,  fibre: 2.4, sugar: 10,  category: "Fruit",      servingSize: 100, servingUnit: "g" },
  { name: "Grapes (100g)",           calories: 69,  protein: 0.7, carbs: 18,  fat: 0.2,  fibre: 0.9, sugar: 15,  category: "Fruit",      servingSize: 100, servingUnit: "g" },
  // Vegetables
  { name: "Broccoli (100g)",         calories: 34,  protein: 2.8, carbs: 7,   fat: 0.4,  fibre: 2.6, sugar: 1.7, category: "Vegetable",  servingSize: 100, servingUnit: "g" },
  { name: "Spinach (100g)",          calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4,  fibre: 2.2, sugar: 0.4, category: "Vegetable",  servingSize: 100, servingUnit: "g" },
  { name: "Carrot (medium)",         calories: 25,  protein: 0.6, carbs: 6,   fat: 0.1,  fibre: 1.7, sugar: 2.9, category: "Vegetable",  servingSize: 61,  servingUnit: "g" },
  { name: "Sweet Potato (medium)",   calories: 103, protein: 2.3, carbs: 24,  fat: 0.1,  fibre: 3.8, sugar: 7.4, category: "Vegetable",  servingSize: 130, servingUnit: "g" },
  { name: "Avocado (half)",          calories: 161, protein: 2,   carbs: 9,   fat: 15,   fibre: 6.7, sugar: 0.7, category: "Vegetable",  servingSize: 100, servingUnit: "g" },
  { name: "Tomato (medium)",         calories: 22,  protein: 1.1, carbs: 4.8, fat: 0.2,  fibre: 1.5, sugar: 3.2, category: "Vegetable",  servingSize: 123, servingUnit: "g" },
  // Protein
  { name: "Chicken Breast (100g)",   calories: 165, protein: 31,  carbs: 0,   fat: 3.6,  fibre: 0,   sugar: 0,   category: "Protein",    servingSize: 100, servingUnit: "g" },
  { name: "Salmon (100g)",           calories: 208, protein: 20,  carbs: 0,   fat: 13,   fibre: 0,   sugar: 0,   category: "Protein",    servingSize: 100, servingUnit: "g" },
  { name: "Tuna (canned, 100g)",     calories: 116, protein: 26,  carbs: 0,   fat: 1,    fibre: 0,   sugar: 0,   category: "Protein",    servingSize: 100, servingUnit: "g" },
  { name: "Egg (large)",             calories: 72,  protein: 6.3, carbs: 0.4, fat: 5,    fibre: 0,   sugar: 0.2, category: "Protein",    servingSize: 50,  servingUnit: "g" },
  { name: "Beef Mince (100g)",       calories: 254, protein: 17,  carbs: 0,   fat: 20,   fibre: 0,   sugar: 0,   category: "Protein",    servingSize: 100, servingUnit: "g" },
  { name: "Tofu (100g)",             calories: 76,  protein: 8,   carbs: 1.9, fat: 4.8,  fibre: 0.3, sugar: 0.7, category: "Protein",    servingSize: 100, servingUnit: "g" },
  // Dairy
  { name: "Greek Yogurt (100g)",     calories: 59,  protein: 10,  carbs: 3.6, fat: 0.4,  fibre: 0,   sugar: 3.6, category: "Dairy",      servingSize: 100, servingUnit: "g" },
  { name: "Cottage Cheese (100g)",   calories: 98,  protein: 11,  carbs: 3.4, fat: 4.3,  fibre: 0,   sugar: 2.7, category: "Dairy",      servingSize: 100, servingUnit: "g" },
  { name: "Whole Milk (240ml)",      calories: 149, protein: 8,   carbs: 12,  fat: 8,    fibre: 0,   sugar: 12,  category: "Dairy",      servingSize: 240, servingUnit: "ml" },
  { name: "Cheddar Cheese (30g)",    calories: 120, protein: 7,   carbs: 0.4, fat: 10,   fibre: 0,   sugar: 0.1, category: "Dairy",      servingSize: 30,  servingUnit: "g" },
  { name: "Butter (1 tbsp)",         calories: 102, protein: 0.1, carbs: 0,   fat: 12,   fibre: 0,   sugar: 0,   category: "Dairy",      servingSize: 14,  servingUnit: "g" },
  // Grains
  { name: "White Rice (100g)",       calories: 130, protein: 2.7, carbs: 28,  fat: 0.3,  fibre: 0.4, sugar: 0,   category: "Grain",      servingSize: 100, servingUnit: "g" },
  { name: "Brown Rice (100g)",       calories: 111, protein: 2.6, carbs: 23,  fat: 0.9,  fibre: 1.8, sugar: 0.4, category: "Grain",      servingSize: 100, servingUnit: "g" },
  { name: "Oats (100g)",             calories: 389, protein: 17,  carbs: 66,  fat: 7,    fibre: 10,  sugar: 1,   category: "Grain",      servingSize: 100, servingUnit: "g" },
  { name: "Wholemeal Bread (slice)", calories: 81,  protein: 4,   carbs: 15,  fat: 1.1,  fibre: 1.9, sugar: 1.4, category: "Grain",      servingSize: 38,  servingUnit: "g" },
  { name: "White Bread (slice)",     calories: 79,  protein: 2.7, carbs: 15,  fat: 1,    fibre: 0.6, sugar: 1.3, category: "Grain",      servingSize: 30,  servingUnit: "g" },
  { name: "Pasta (100g dry)",        calories: 371, protein: 13,  carbs: 75,  fat: 1.5,  fibre: 3,   sugar: 2.7, category: "Grain",      servingSize: 100, servingUnit: "g" },
  { name: "Quinoa (100g cooked)",    calories: 120, protein: 4.4, carbs: 21,  fat: 1.9,  fibre: 2.8, sugar: 0.9, category: "Grain",      servingSize: 100, servingUnit: "g" },
  // Nuts & Seeds
  { name: "Almonds (30g)",           calories: 173, protein: 6,   carbs: 6,   fat: 15,   fibre: 3.5, sugar: 1.3, category: "Nuts/Seeds", servingSize: 30,  servingUnit: "g" },
  { name: "Peanut Butter (2 tbsp)",  calories: 188, protein: 8,   carbs: 6,   fat: 16,   fibre: 1.9, sugar: 3,   category: "Nuts/Seeds", servingSize: 32,  servingUnit: "g" },
  // Snacks
  { name: "Chocolate Bar (50g)",     calories: 270, protein: 3.3, carbs: 30,  fat: 15,   fibre: 1.5, sugar: 26,  category: "Snack",      servingSize: 50,  servingUnit: "g" },
  { name: "Crisps/Chips (30g)",      calories: 155, protein: 2,   carbs: 16,  fat: 10,   fibre: 1.2, sugar: 0.2, category: "Snack",      servingSize: 30,  servingUnit: "g" },
  // Fast Food
  { name: "McDonalds Big Mac",       calories: 550, protein: 25,  carbs: 46,  fat: 30,   fibre: 3,   sugar: 9,   category: "Fast Food",  servingSize: 200, servingUnit: "g" },
  { name: "Pepperoni Pizza (slice)", calories: 298, protein: 12,  carbs: 34,  fat: 13,   fibre: 2.3, sugar: 3.6, category: "Fast Food",  servingSize: 107, servingUnit: "g" },
  // Drinks
  { name: "Orange Juice (240ml)",    calories: 112, protein: 1.7, carbs: 26,  fat: 0.5,  fibre: 0.5, sugar: 21,  category: "Drink",      servingSize: 240, servingUnit: "ml" },
  { name: "Coca-Cola (330ml)",       calories: 139, protein: 0,   carbs: 35,  fat: 0,    fibre: 0,   sugar: 35,  category: "Drink",      servingSize: 330, servingUnit: "ml" },
  { name: "Coffee (black, 240ml)",   calories: 2,   protein: 0.3, carbs: 0,   fat: 0,    fibre: 0,   sugar: 0,   category: "Drink",      servingSize: 240, servingUnit: "ml" },
  // Supplements
  { name: "Protein Shake (1 scoop)", calories: 120, protein: 24,  carbs: 3,   fat: 2,    fibre: 1,   sugar: 1,   category: "Supplement", servingSize: 35,  servingUnit: "g" },
];

SEED_FOODS.forEach(food => {
  const id = uuidv4();
  db.foodDB[id] = { id, ...food, verified: true };
});

module.exports = db;
