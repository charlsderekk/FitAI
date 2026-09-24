document.addEventListener("DOMContentLoaded", () => {
  initAuthModule();

  const currentUser = getCurrentUser();
  if (currentUser) {
    startApp(currentUser);
  }
  // else: the auth screen (visible by default in the HTML) stays up.
});

function startApp(username) {
  State.load(username);
  initAllModules();
  checkAchievements();

  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");
  document.getElementById("current-user-label").textContent = `Hi, ${getDisplayName(username)}`;

  setActiveView(State.data.profile ? "dashboard" : "profile");

  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }
  checkDueReminders();
  setInterval(checkDueReminders, 60000);
}
