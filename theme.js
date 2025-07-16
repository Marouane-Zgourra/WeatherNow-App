/* === Theme Switch Elements === */
const themeSwitch = document.getElementById("theme-switch");
const body = document.body;
const favicon = document.getElementById("favicon");

/* === Apply theme based on preference === */
function applyTheme(isDark) {
  body.classList.toggle("dark-mode", isDark);
  body.classList.toggle("light-mode", !isDark);

  favicon.href = isDark
    ? "https://img.icons8.com/ios-filled/50/000000/partly-cloudy-day.png"
    : "https://img.icons8.com/ios-filled/50/ffffff/partly-cloudy-day.png";

  themeSwitch.checked = isDark;
  // Save preference to localStorage
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

/* === Initialize theme on page load === */
function initTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    // Use saved preference
    applyTheme(savedTheme === "dark");
  } else {
    // No saved preference, check OS preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark);
  }
}

/* === Event listener for theme toggle switch === */
themeSwitch.addEventListener("change", () => {
  applyTheme(themeSwitch.checked);
});

/* === Run on DOM load === */
document.addEventListener("DOMContentLoaded", initTheme);
