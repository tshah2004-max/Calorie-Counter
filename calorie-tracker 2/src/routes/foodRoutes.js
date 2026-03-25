const { Router } = require("express");
const { searchFoods, getFoodById, createCustomFood, getCategories } = require("../controllers/foodController");
const { authenticate } = require("../middleware/auth");
const router = Router();
router.get("/",           searchFoods);
router.get("/categories", getCategories);
router.get("/:id",        getFoodById);
router.post("/",          authenticate, createCustomFood);
module.exports = router;
