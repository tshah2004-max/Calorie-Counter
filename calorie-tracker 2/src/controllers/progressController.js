const db = require("../models/db");
const { summariseLog, calcBMR } = require("../utils/nutrition");
const { today } = require("../utils/helpers");
const { ACTIVITY_MULTIPLIERS } = require("../config/constants");

function getProgress(req, res) {
  const to   = req.query.to || today();
  const from = req.query.from || (() => { const d = new Date(to); d.setDate(d.getDate() - 6); return d.toISOString().split("T")[0]; })();
  const days = [];
  const cursor = new Date(from), end = new Date(to);
  while (cursor <= end) {
    const ds      = cursor.toISOString().split("T")[0];
    const entries = db.foodLogs[req.userId][ds] || [];
    days.push({ date: ds, ...summariseLog(entries), water: db.water[req.userId][ds] || 0, entries: entries.length, logged: entries.length > 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  const loggedDays = days.filter(d => d.logged);
  const avgCalories = loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d.calories, 0) / loggedDays.length) : 0;
  return res.json({ from, to, days, summary: { totalDays: days.length, loggedDays: loggedDays.length, avgCalories }, goals: db.goals[req.userId] });
}

function getStreak(req, res) {
  let streak = 0;
  const cursor = new Date();
  while ((db.foodLogs[req.userId][cursor.toISOString().split("T")[0]] || []).length) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return res.json({ streak, message: streak > 0 ? `🔥 ${streak}-day streak!` : "Start logging today to build your streak!" });
}

function getGoals(req, res) { return res.json(db.goals[req.userId]); }

function updateGoals(req, res) {
  for (const field of ["calories","protein","carbs","fat","fibre","water"]) {
    if (req.body[field] !== undefined) {
      const v = parseFloat(req.body[field]);
      if (isNaN(v) || v < 0) return res.status(400).json({ error: `${field} must be a non-negative number.` });
      db.goals[req.userId][field] = v;
    }
  }
  return res.json({ message: "Goals updated.", goals: db.goals[req.userId] });
}

function bmrCalculator(req, res) {
  const { weightKg, heightCm, age, gender } = req.query;
  if (!weightKg || !heightCm || !age || !gender) return res.status(400).json({ error: "Provide: weightKg, heightCm, age, gender" });
  const w = parseFloat(weightKg), h = parseFloat(heightCm), a = parseInt(age);
  if ([w, h, a].some(isNaN)) return res.status(400).json({ error: "weightKg, heightCm, and age must be numbers." });
  const mockDob = new Date(new Date().setFullYear(new Date().getFullYear() - a)).toISOString().split("T")[0];
  const bmr = calcBMR({ weightKg: w, heightCm: h, gender, dateOfBirth: mockDob });
  const tdeeByActivity = {};
  for (const [level, mult] of Object.entries(ACTIVITY_MULTIPLIERS)) tdeeByActivity[level] = Math.round(bmr * mult);
  return res.json({ bmr, tdeeByActivity });
}

module.exports = { getProgress, getStreak, getGoals, updateGoals, bmrCalculator };
