document.addEventListener("DOMContentLoaded", () => {
  const themeSwitch = document.getElementById("theme-switch");
  const body = document.body;
  const favicon = document.getElementById("favicon");

  body.classList.add("light-mode");
  body.classList.remove("dark-mode");
  themeSwitch.checked = false;
  favicon.href = "https://img.icons8.com/ios-filled/50/ffffff/partly-cloudy-day.png";

  themeSwitch.addEventListener("change", () => {
    const isDark = themeSwitch.checked;
    body.classList.toggle("dark-mode", isDark);
    body.classList.toggle("light-mode", !isDark);

    favicon.href = isDark
      ? "https://img.icons8.com/ios-filled/50/000000/partly-cloudy-day.png"
      : "https://img.icons8.com/ios-filled/50/ffffff/partly-cloudy-day.png";
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn("User denied geolocation");
      }
    );
  }
});
