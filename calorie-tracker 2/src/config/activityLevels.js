const ACTIVITY_LEVELS = {
  sedentary:   { multiplier: 1.2,   label: "Sedentary (little or no exercise)" },
  light:       { multiplier: 1.375, label: "Light (1-3 days/week)" },
  moderate:    { multiplier: 1.55,  label: "Moderate (3-5 days/week)" },
  active:      { multiplier: 1.725, label: "Active (6-7 days/week)" },
  very_active: { multiplier: 1.9,   label: "Very Active (hard exercise, physical job)" },
};
const ACTIVITY_KEYS = Object.keys(ACTIVITY_LEVELS);
module.exports = { ACTIVITY_LEVELS, ACTIVITY_KEYS };
