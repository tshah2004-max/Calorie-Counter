const bcrypt = require("bcryptjs");
const db     = require("../models/db");
const { calcBMR, calcTDEE, calcDefaultGoals, calcAge } = require("../utils/nutrition");
const { sanitiseUser } = require("../utils/helpers");
const { VALID_ACTIVITIES, VALID_GOALS, VALID_GENDERS, MIN_PASSWORD_LENGTH } = require("../config/constants");

function getMe(req, res) {
  return res.json({ ...sanitiseUser(req.user), age: calcAge(req.user.dateOfBirth), bmr: calcBMR(req.user), tdee: calcTDEE(req.user), goals: db.goals[req.userId] });
}

function updateMe(req, res) {
  if (req.body.activityLevel && !VALID_ACTIVITIES.includes(req.body.activityLevel)) return res.status(400).json({ error: `activityLevel must be: ${VALID_ACTIVITIES.join(", ")}` });
  if (req.body.weightGoal    && !VALID_GOALS.includes(req.body.weightGoal))         return res.status(400).json({ error: `weightGoal must be: ${VALID_GOALS.join(", ")}` });
  if (req.body.gender        && !VALID_GENDERS.includes(req.body.gender))           return res.status(400).json({ error: `gender must be: ${VALID_GENDERS.join(", ")}` });

  for (const key of ["displayName","bio","profilePic","weightKg","heightCm","activityLevel","weightGoal","gender"]) {
    if (req.body[key] !== undefined) db.users[req.userId][key] = (key === "weightKg" || key === "heightCm") ? parseFloat(req.body[key]) : req.body[key];
  }
  db.goals[req.userId] = { ...db.goals[req.userId], ...calcDefaultGoals(db.users[req.userId]) };
  return res.json({ message: "Profile updated.", user: sanitiseUser(db.users[req.userId]) });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Provide currentPassword and newPassword." });
  if (newPassword.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `New password must be ${MIN_PASSWORD_LENGTH}+ characters.` });
  if (!(await bcrypt.compare(currentPassword, req.user.passwordHash))) return res.status(401).json({ error: "Current password is incorrect." });
  db.users[req.userId].passwordHash = await bcrypt.hash(newPassword, 12);
  return res.json({ message: "Password changed." });
}

async function deleteMe(req, res) {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Provide your password to confirm deletion." });
  if (!(await bcrypt.compare(password, req.user.passwordHash))) return res.status(401).json({ error: "Password incorrect." });
  delete db.users[req.userId]; delete db.foodLogs[req.userId]; delete db.goals[req.userId]; delete db.water[req.userId]; delete db.weight[req.userId];
  for (const [t, uid] of Object.entries(db.sessions)) { if (uid === req.userId) delete db.sessions[t]; }
  return res.json({ message: "Account permanently deleted." });
}

module.exports = { getMe, updateMe, changePassword, deleteMe };
