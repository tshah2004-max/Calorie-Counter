const { Router } = require("express");
const { authenticate }          = require("../middleware/auth");
const { getGoals, updateGoals } = require("../controllers/goalsController");

const router = Router();

router.use(authenticate);

router.get("/",   getGoals);
router.patch("/", updateGoals);

module.exports = router;
