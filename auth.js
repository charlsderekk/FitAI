/* =========================================================
   FitAI — accounts.

   IMPORTANT, for the demo/README: this is a client-side-only
   gate, not real authentication. There's no server, so "logging
   in" just switches which local data set is loaded. Passwords
   are hashed (SHA-256) before being stored so they're not sitting
   in localStorage as plain text, but anyone with access to this
   browser's dev tools could still inspect localStorage directly.
   Good enough to demo separate accounts for a class project —
   not something to reuse for anything that holds real user data.
   ========================================================= */

const USERS_KEY = "fitai_users";
const CURRENT_USER_KEY = "fitai_current_user";

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}
function setCurrentUser(key) {
  localStorage.setItem(CURRENT_USER_KEY, key);
}
function logOut() {
  localStorage.removeItem(CURRENT_USER_KEY);
  location.reload();
}

function getDisplayName(key) {
  const user = loadUsers().find((u) => u.key === key);
  return user ? user.displayName : key;
}

async function signUp(name, password) {
  const key = normalizeName(name);
  if (!key) throw new Error("Enter a name.");
  if (password.length < 4) throw new Error("Password should be at least 4 characters.");
  const users = loadUsers();
  if (users.some((u) => u.key === key)) {
    throw new Error("That name is already taken — try logging in instead.");
  }
  const passwordHash = await hashPassword(password);
  users.push({ key, displayName: name.trim(), passwordHash });
  saveUsers(users);
  setCurrentUser(key);
}

async function logIn(name, password) {
  const key = normalizeName(name);
  const user = loadUsers().find((u) => u.key === key);
  if (!user) throw new Error("No account with that name — try signing up.");
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) throw new Error("Incorrect password.");
  setCurrentUser(key);
}

function initAuthModule() {
  const loginTab = document.getElementById("auth-tab-login");
  const signupTab = document.getElementById("auth-tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const errorBox = document.getElementById("auth-error");

  function showLogin() {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    errorBox.textContent = "";
  }
  function showSignup() {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    errorBox.textContent = "";
  }

  loginTab.addEventListener("click", showLogin);
  signupTab.addEventListener("click", showSignup);

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";
    const name = document.getElementById("signup-name").value;
    const pw = document.getElementById("signup-password").value;
    const pw2 = document.getElementById("signup-password-confirm").value;
    if (pw !== pw2) {
      errorBox.textContent = "Passwords don't match.";
      return;
    }
    try {
      await signUp(name, pw);
      location.reload();
    } catch (err) {
      errorBox.textContent = err.message;
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";
    const name = document.getElementById("login-name").value;
    const pw = document.getElementById("login-password").value;
    try {
      await logIn(name, pw);
      location.reload();
    } catch (err) {
      errorBox.textContent = err.message;
    }
  });

  document.getElementById("btn-logout").addEventListener("click", logOut);
}
