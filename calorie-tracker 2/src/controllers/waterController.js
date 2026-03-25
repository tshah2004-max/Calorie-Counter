const db = require("../models/db");
const { today, isValidDate } = require("../utils/helpers");

function buildWaterPayload(userId, date) {
  const totalMl = db.water[userId][date] || 0;
  const goalMl  = db.goals[userId].water;
  return { date, totalMl, goalMl, remaining: Math.max(0, goalMl - totalMl), percentDone: Math.min(100, Math.round((totalMl / goalMl) * 100)) };
}

function logWater(req, res, date) {
  const ml = parseFloat(req.body.ml);
  if (isNaN(ml) || ml <= 0) return res.status(400).json({ error: "ml must be a positive number." });
  db.water[req.userId][date] = (db.water[req.userId][date] || 0) + ml;
  return res.json({ message: `${ml}ml logged!`, ...buildWaterPayload(req.userId, date) });
}

const logWaterToday  = (req, res) => logWater(req, res, today());
const getWaterToday  = (req, res) => res.json(buildWaterPayload(req.userId, today()));

function logWaterByDate(req, res) {
  const { date } = req.params;
  if (!isValidDate(date)) return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD." });
  return logWater(req, res, date);
}

function getWaterByDate(req, res) {
  const { date } = req.params;
  if (!isValidDate(date)) return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD." });
  return res.json(buildWaterPayload(req.userId, date));
}

module.exports = { logWaterToday, logWaterByDate, getWaterToday, getWaterByDate };
