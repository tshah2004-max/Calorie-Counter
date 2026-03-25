const db = require("../models/db");
const { today, isValidDate } = require("../utils/helpers");

function logWeight(req, res) {
  const { kg, date = today() } = req.body;
  if (kg === undefined) return res.status(400).json({ error: "kg is required." });
  if (!isValidDate(date)) return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD." });
  const weight = parseFloat(kg);
  if (isNaN(weight) || weight <= 0) return res.status(400).json({ error: "kg must be a positive number." });

  const entry   = { date, kg: weight, loggedAt: new Date().toISOString() };
  const history = db.weight[req.userId];
  const idx     = history.findIndex(e => e.date === date);
  if (idx > -1) history[idx] = entry; else history.push(entry);
  history.sort((a, b) => a.date.localeCompare(b.date));
  if (date === today()) db.users[req.userId].weightKg = weight;

  return res.json({ message: "Weight logged!", entry, totalChange: history.length > 1 ? Math.round((weight - history[0].kg) * 100) / 100 : 0 });
}

function getWeightHistory(req, res) {
  const history = db.weight[req.userId] || [];
  const current = history.length ? history[history.length - 1] : null;
  const start   = history.length ? history[0] : null;
  return res.json({ history, current: current?.kg ?? null, start: start?.kg ?? null, totalChange: history.length > 1 ? Math.round((current.kg - start.kg) * 100) / 100 : 0, goal: db.users[req.userId].weightGoal, entryCount: history.length });
}

module.exports = { logWeight, getWeightHistory };
