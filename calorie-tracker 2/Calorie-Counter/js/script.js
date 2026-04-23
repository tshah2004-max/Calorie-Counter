const API = "http://localhost:3000";

requireAuth();

async function loadDashboard() {
  const userRes = await fetch(`${API}/users/me`, { headers: authHeaders() });
  const user = await userRes.json();
  if (document.getElementById("userName")) document.getElementById("userName").textContent = user.displayName;
  if (document.getElementById("welcomeName")) document.getElementById("welcomeName").textContent = user.displayName;

  const goalsRes = await fetch(`${API}/goals`, { headers: authHeaders() });
  const goals = await goalsRes.json();
  const map = { "extreme-loss": goals.extremeLoss, loss: goals.loss, maintenance: goals.maintain };
  for (const [id, val] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.textContent = `${val} kcal`;
  }
}

loadDashboard();
