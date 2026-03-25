const { Router } = require("express");
const { logWeight, getWeightHistory } = require("../controllers/weightController");
const { authenticate } = require("../middleware/auth");
const router = Router();
router.use(authenticate);
router.post("/", logWeight);
router.get("/",  getWeightHistory);
module.exports = router;
