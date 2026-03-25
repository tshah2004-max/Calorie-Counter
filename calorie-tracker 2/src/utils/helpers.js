/**
 * General utility helpers
 */

/** Returns today as YYYY-MM-DD */
const today = () => new Date().toISOString().split("T")[0];

/** Validates a YYYY-MM-DD date string */
const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

/** Removes passwordHash before sending user data to the client */
const sanitiseUser = ({ passwordHash, ...safe }) => safe;

/**
 * Groups food log entries by meal
 * @param {Array} entries
 * @returns {{ breakfast, lunch, dinner, snack, other }}
 */
function groupByMeal(entries) {
  const groups = { breakfast: [], lunch: [], dinner: [], snack: [], other: [] };
  for (const entry of entries) {
    const meal = entry.meal || "other";
    (groups[meal] = groups[meal] || []).push(entry);
  }
  return groups;
}

module.exports = { today, isValidDate, sanitiseUser, groupByMeal };
