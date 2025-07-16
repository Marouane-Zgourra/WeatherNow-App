/* === DOM Elements === */
const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const loader = document.getElementById("loader");
const apiKey = "bf4e33eabc6aca3226dc0a7d82de72fc";

/* === Form Submit Handler === */
weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city) {
    showLoader(true);
    try {
      const WeatherData = await getWeatherData(city);
      displayWeatherInfo(WeatherData.current);
      displayForecastInfo(WeatherData.forecast);
    } catch (error) {
      console.error(error);
      displayError(error.message || error);
    } finally {
      showLoader(false);
    }
  } else {
    displayError("Please enter a city");
  }
});

/* === Fetch Weather Data from API === */
async function getWeatherData(city) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}`;

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error("Could not fetch weather data");
  }

  const currentData = await currentResponse.json();
  const forecastData = await forecastResponse.json();

  return { current: currentData, forecast: forecastData };
}

/* === Display Current Weather Information === */
function displayWeatherInfo(data) {
  const {
    name: city,
    main: { temp, humidity },
    weather: [{ description }],
  } = data;

  card.textContent = "";
  card.style.display = "flex";

  const cityDisplay = document.createElement("h1");
  const tempDisplay = document.createElement("p");
  const humidityDisplay = document.createElement("p");
  const descDisplay = document.createElement("p");

  cityDisplay.textContent = city;
  tempDisplay.textContent = `${(temp - 273.15).toFixed(1)}°C`;
  humidityDisplay.textContent = `Humidity: ${humidity}%`;
  descDisplay.textContent = description;

  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  const weatherIcon = document.createElement("img");
  weatherIcon.src = iconUrl;
  weatherIcon.alt = description;
  weatherIcon.classList.add("weatherEmoji");

  cityDisplay.classList.add("cityDisplay");
  tempDisplay.classList.add("tempDisplay");
  humidityDisplay.classList.add("humidityDisplay");
  descDisplay.classList.add("descDisplay");

  card.appendChild(cityDisplay);
  card.appendChild(tempDisplay);
  card.appendChild(humidityDisplay);
  card.appendChild(descDisplay);
  card.appendChild(weatherIcon);
}

/* === Display Weather Forecast Information === */
function displayForecastInfo(forecastData) {
  const forecastContainer = document.createElement("div");
  forecastContainer.classList.add("forecastContainer");

  const sliced = forecastData.list.slice(0, 8);
  let lastDay = null;

  sliced.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const today = new Date();

    let dayLabel;
    if (date.toDateString() === today.toDateString()) {
      dayLabel = "Today";
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) {
        dayLabel = "Tomorrow";
      } else {
        dayLabel = dayName;
      }
    }

    if (dayLabel !== lastDay) {
      const separator = document.createElement("div");
      separator.classList.add("daySeparator");
      separator.textContent = dayLabel;
      forecastContainer.appendChild(separator);
      lastDay = dayLabel;
    }

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const temp = `${(item.main.temp - 273.15).toFixed(1)}°C`;
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecastItem");
    forecastItem.innerHTML = `
      <p>${time}</p>
      <img src="${iconUrl}" alt="Weather icon" />
      <p>${temp}</p>
    `;

    forecastContainer.appendChild(forecastItem);
  });

  card.appendChild(forecastContainer);
}

/* === Display Error Messages === */
function displayError(message) {
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");
  card.textContent = "";
  card.style.display = "flex";
  card.appendChild(errorDisplay);
}

/* === Fetch Weather Data Using Coordinates === */
function getWeatherByCoords(lat, lon) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  showLoader(true);

  Promise.all([fetch(currentUrl), fetch(forecastUrl)])
    .then(async ([curRes, foreRes]) => {
      if (!curRes.ok || !foreRes.ok) throw new Error("Location fetch failed");
      const current = await curRes.json();
      const forecast = await foreRes.json();
      displayWeatherInfo(current);
      displayForecastInfo(forecast);
    })
    .catch(() => displayError("Location weather not available"))
    .finally(() => {
      showLoader(false);
    });
}
window.getWeatherByCoords = getWeatherByCoords;

/* === Show or Hide Loader === */
function showLoader(show) {
  if (show) {
    card.style.display = "flex";
    loader.style.display = "block";

    [...card.children].forEach((child) => {
      if (child !== loader) child.remove();
    });
  } else {
    loader.style.display = "none";
  }
}

/* === Update Time and Date Display === */
function updateTimeDate() {
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");

  if (!timeEl || !dateEl) return;

  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const date = now.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  timeEl.textContent = time;
  dateEl.textContent = date;
}

/* === Initialize Time and Date on DOM Load === */
document.addEventListener("DOMContentLoaded", () => {
  updateTimeDate();
  setInterval(updateTimeDate, 1000);

  // === Geolocation Code (runs on page load) ===
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        console.warn("User denied geolocation");
      }
    );
  }
});
