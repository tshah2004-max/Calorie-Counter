const bcrypt  = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db      = require("../models/db");
const { calcBMR, calcTDEE, calcCalorieGoal, calcDefaultGoals, calcAge } = require("../utils/nutrition");
const { today } = require("../utils/helpers");
const { VALID_GENDERS, VALID_GOALS, VALID_ACTIVITIES, MIN_PASSWORD_LENGTH, MIN_AGE } = require("../config/constants");

async function register(req, res) {
  const { username, email, password, dateOfBirth, gender, weightKg, heightCm, activityLevel = "moderate", weightGoal = "maintain" } = req.body;

  const missing = ["username","email","password","dateOfBirth","gender","weightKg","heightCm"].filter(k => !req.body[k]);
  if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  if (password.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return res.status(400).json({ error: "dateOfBirth must be YYYY-MM-DD." });

  const age = calcAge(dateOfBirth);
  if (age < MIN_AGE) return res.status(400).json({ error: `You must be ${MIN_AGE} or older to register. Your age: ${age}.` });
  if (!VALID_GENDERS.includes(gender)) return res.status(400).json({ error: `gender must be: ${VALID_GENDERS.join(", ")}` });
  if (!VALID_ACTIVITIES.includes(activityLevel)) return res.status(400).json({ error: `activityLevel must be: ${VALID_ACTIVITIES.join(", ")}` });
  if (!VALID_GOALS.includes(weightGoal)) return res.status(400).json({ error: `weightGoal must be: ${VALID_GOALS.join(", ")}` });

  const users = Object.values(db.users);
  if (users.some(u => u.email === email.toLowerCase())) return res.status(409).json({ error: "Email already registered." });
  if (users.some(u => u.username === username.toLowerCase())) return res.status(409).json({ error: "Username already taken." });

  const userId = uuidv4();
  const user = {
    id: userId, username: username.toLowerCase(), displayName: username,
    email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12),
    dateOfBirth, gender, weightKg: parseFloat(weightKg), heightCm: parseFloat(heightCm),
    activityLevel, weightGoal, createdAt: new Date().toISOString(), profilePic: null, bio: "",
  };

  db.users[userId]    = user;
  db.foodLogs[userId] = {};
  db.water[userId]    = {};
  db.weight[userId]   = [{ date: today(), kg: parseFloat(weightKg), loggedAt: new Date().toISOString() }];
  db.goals[userId]    = calcDefaultGoals(user);

  return res.status(201).json({ message: "Account created! Welcome 🎉", userId, age, bmr: calcBMR(user), tdee: calcTDEE(user), suggestedCalorieGoal: calcCalorieGoal(user) });
}

async function login(req, res) {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) return res.status(400).json({ error: "Provide emailOrUsername and password." });

  const user = Object.values(db.users).find(u => u.email === emailOrUsername.toLowerCase() || u.username === emailOrUsername.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Invalid credentials." });

  const token = uuidv4();
  db.sessions[token] = user.id;
  return res.json({ message: `Welcome back, ${user.displayName}!`, token, userId: user.id });
}

function logout(req, res) {
  delete db.sessions[req.token];
  return res.json({ message: "Logged out successfully." });
}

module.exports = { register, login, logout };
