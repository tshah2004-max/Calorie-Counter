const API = "http://localhost:3000";
// SIGNUP
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("error-message");
    errorEl.style.display = "none";
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!name) {
      errorEl.textContent = "Please enter your full name.";
      errorEl.style.display = "block";
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      errorEl.textContent = "Please enter a valid email address.";
      errorEl.style.display = "block";
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = "Password must be at least 6 characters long.";
      errorEl.style.display = "block";
      return;
    }
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        errorEl.textContent = data.error || "Registration failed.";
        errorEl.style.display = "block";
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "setprofile.html";
    } catch (err) {
      errorEl.textContent = "Cannot reach server. Is it running?";
      errorEl.style.display = "block";
    }
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("error-message");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: document.getElementById("email").value,
          password: document.getElementById("password").value,
        }),
      });
      const data = await res.json();
      if (!res.ok) { errorEl.textContent = data.error; errorEl.style.display = "block"; return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "dashboard.html";
    } catch {
      errorEl.textContent = "Cannot reach server. Is it running?";
      errorEl.style.display = "block";
    }
  });
}

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// Redirect to login if no token
function requireAuth() {
  if (!localStorage.getItem("token")) window.location.href = "login.html";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}
