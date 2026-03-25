const { Router } = require("express");
const { getProgress, getStreak, getGoals, updateGoals, bmrCalculator } = require("../controllers/progressController");
const { authenticate } = require("../middleware/auth");
const router = Router();
router.get("/calculator/bmr", bmrCalculator);           // public
router.use(authenticate);
router.get("/streak",  getStreak);
router.get("/",        getProgress);
router.get("/goals",   getGoals);
router.patch("/goals", updateGoals);
module.exports = router;
