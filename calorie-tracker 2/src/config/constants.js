/**
 * App-wide constants
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

const VALID_GENDERS    = ["male", "female", "other"];
const VALID_GOALS      = ["lose", "maintain", "gain"];
const VALID_MEALS      = ["breakfast", "lunch", "dinner", "snack", "other"];
const VALID_ACTIVITIES = Object.keys(ACTIVITY_MULTIPLIERS);

const GOAL_CALORIE_DELTA  = { lose: -500, maintain: 0, gain: 300 };
const MIN_PASSWORD_LENGTH = 8;
const MIN_AGE             = 16;
const DEFAULT_WATER_GOAL  = 2500; // ml/day
const DEFAULT_FIBRE_GOAL  = 30;   // g/day
const PROTEIN_PER_KG      = 1.8;  // g per kg bodyweight
const CARB_RATIO          = 0.45; // 45% of calories from carbs
const FAT_RATIO           = 0.30; // 30% of calories from fat
const MIN_CALORIES        = 1200; // floor for calorie goal

module.exports = {
  ACTIVITY_MULTIPLIERS,
  VALID_GENDERS,
  VALID_GOALS,
  VALID_MEALS,
  VALID_ACTIVITIES,
  GOAL_CALORIE_DELTA,
  MIN_PASSWORD_LENGTH,
  MIN_AGE,
  DEFAULT_WATER_GOAL,
  DEFAULT_FIBRE_GOAL,
  PROTEIN_PER_KG,
  CARB_RATIO,
  FAT_RATIO,
  MIN_CALORIES,
};
