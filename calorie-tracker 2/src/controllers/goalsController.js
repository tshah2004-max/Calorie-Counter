/**
 * Goals Controller
 * Handles: get goals, update goals
 */

const db = require("../models/db");

// GET /goals
function getGoals(req, res) {
  return res.json(db.goals[req.userId]);
}

// PATCH /goals
function updateGoals(req, res) {
  const EDITABLE_GOALS = ["calories", "protein", "carbs", "fat", "fibre", "water"];

  for (const field of EDITABLE_GOALS) {
    if (req.body[field] !== undefined) {
      const value = parseFloat(req.body[field]);
      if (isNaN(value) || value < 0) {
        return res.status(400).json({ error: `Invalid value for ${field}. Must be a positive number.` });
      }
      db.goals[req.userId][field] = value;
    }
  }

  return res.json({ message: "Goals updated.", goals: db.goals[req.userId] });
}

module.exports = { getGoals, updateGoals };
