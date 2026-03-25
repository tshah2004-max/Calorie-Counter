const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");
const { summariseLog, calcEntryNutrition } = require("../utils/nutrition");
const { today, isValidDate, groupByMeal } = require("../utils/helpers");
const { VALID_MEALS } = require("../config/constants");

function buildDiaryPayload(userId, date) {
  const entries = db.foodLogs[userId][date] || [];
  const totals  = summariseLog(entries);
  const goals   = db.goals[userId];
  const water   = db.water[userId][date] || 0;
  return {
    date, meals: groupByMeal(entries), totals, goals,
    remaining: { calories: Math.round(goals.calories - totals.calories), protein: Math.round(goals.protein - totals.protein), carbs: Math.round(goals.carbs - totals.carbs), fat: Math.round(goals.fat - totals.fat) },
    water: { logged: water, goal: goals.water }, entryCount: entries.length,
  };
}

function getDiaryToday(req, res) { return res.json(buildDiaryPayload(req.userId, today())); }

function getDiaryByDate(req, res) {
  const { date } = req.params;
  if (!isValidDate(date)) return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD." });
  return res.json(buildDiaryPayload(req.userId, date));
}

function addEntry(req, res) {
  const { date } = req.params;
  if (!isValidDate(date)) return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD." });

  const { foodId, quantityG, meal = "other", notes = "" } = req.body;
  if (!foodId || quantityG === undefined) return res.status(400).json({ error: "foodId and quantityG are required." });

  const food = db.foodDB[foodId];
  if (!food) return res.status(404).json({ error: "Food not found. Search /foods to find a valid foodId." });

  const qty = parseFloat(quantityG);
  if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: "quantityG must be a positive number." });
  if (!VALID_MEALS.includes(meal)) return res.status(400).json({ error: `meal must be: ${VALID_MEALS.join(", ")}` });

  if (!db.foodLogs[req.userId][date]) db.foodLogs[req.userId][date] = [];

  const entry = { id: uuidv4(), foodId, food: { ...food }, quantityG: qty, meal, notes, loggedAt: new Date().toISOString() };
  db.foodLogs[req.userId][date].push(entry);

  return res.status(201).json({ message: `${food.name} logged for ${meal}!`, entry, nutrition: calcEntryNutrition(food, qty), dayTotal: summariseLog(db.foodLogs[req.userId][date]) });
}

function updateEntry(req, res) {
  const { date, entryId } = req.params;
  if (!isValidDate(date)) return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD." });
  const log   = db.foodLogs[req.userId]?.[date];
  const entry = log?.find(e => e.id === entryId);
  if (!entry) return res.status(404).json({ error: "Entry not found." });

  if (req.body.quantityG !== undefined) {
    const qty = parseFloat(req.body.quantityG);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ error: "quantityG must be positive." });
    entry.quantityG = qty;
  }
  if (req.body.meal) {
    if (!VALID_MEALS.includes(req.body.meal)) return res.status(400).json({ error: `meal must be: ${VALID_MEALS.join(", ")}` });
    entry.meal = req.body.meal;
  }
  if (req.body.notes !== undefined) entry.notes = req.body.notes;
  return res.json({ message: "Entry updated.", entry, dayTotal: summariseLog(log) });
}

function deleteEntry(req, res) {
  const { date, entryId } = req.params;
  if (!isValidDate(date)) return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD." });
  const log = db.foodLogs[req.userId]?.[date];
  if (!log) return res.status(404).json({ error: "No diary log for this date." });
  const index = log.findIndex(e => e.id === entryId);
  if (index === -1) return res.status(404).json({ error: "Entry not found." });
  const [removed] = log.splice(index, 1);
  return res.json({ message: `Removed "${removed.food.name}" from diary.`, dayTotal: summariseLog(log) });
}

module.exports = { getDiaryToday, getDiaryByDate, addEntry, updateEntry, deleteEntry };
