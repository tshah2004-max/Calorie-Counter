const today       = () => new Date().toISOString().split("T")[0];
const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

function calcAge(dob) {
  const birth = new Date(dob), now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
module.exports = { today, isValidDate, calcAge };
