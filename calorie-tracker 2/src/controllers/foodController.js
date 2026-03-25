const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");

function searchFoods(req, res) {
  const { q = "", category = "" } = req.query;
  const results = Object.values(db.foodDB).filter(f =>
    f.name.toLowerCase().includes(q.toLowerCase()) &&
    (!category || f.category.toLowerCase() === category.toLowerCase())
  );
  return res.json({ count: results.length, results });
}

function getFoodById(req, res) {
  const food = db.foodDB[req.params.id];
  if (!food) return res.status(404).json({ error: "Food not found." });
  return res.json(food);
}

function createCustomFood(req, res) {
  const { name, calories, protein=0, carbs=0, fat=0, fibre=0, sugar=0, servingSize=100, servingUnit="g", category="Custom" } = req.body;
  if (!name || calories === undefined) return res.status(400).json({ error: "name and calories are required." });
  if (isNaN(parseFloat(calories)) || parseFloat(calories) < 0) return res.status(400).json({ error: "calories must be a non-negative number." });
  const id = uuidv4();
  db.foodDB[id] = { id, name, calories:+calories, protein:+protein, carbs:+carbs, fat:+fat, fibre:+fibre, sugar:+sugar, servingSize:+servingSize, servingUnit, category, verified:false, createdBy:req.userId, createdAt:new Date().toISOString() };
  return res.status(201).json({ message: "Custom food added.", food: db.foodDB[id] });
}

function getCategories(_req, res) {
  return res.json([...new Set(Object.values(db.foodDB).map(f => f.category))].sort());
}

module.exports = { searchFoods, getFoodById, createCustomFood, getCategories };
