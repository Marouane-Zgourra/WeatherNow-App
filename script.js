const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const loader = document.querySelector(".loader");
const apiKey = "bf4e33eabc6aca3226dc0a7d82de72fc";

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value;

  if (city) {
    showLoader(true);
    try {
      const WeatherData = await getWeatherData(city);
      displayWeatherInfo(WeatherData.current);
      displayForecastInfo(WeatherData.forecast);
    } catch (error) {
      console.error(error);
      displayError(error);
    } finally {
      showLoader(false);
    }
  } else {
    displayError("Please enter a city");
  }
});

async function getWeatherData(city) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

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

function displayWeatherInfo(data) {
  const {
    name: city,
    main: { temp, humidity },
    weather: [{ description, id }],
  } = data;

  card.textContent = "";
  card.style.display = "flex";

  const cityDisplay = document.createElement("h1");
  const tempDisplay = document.createElement("p");
  const humidityDisplay = document.createElement("p");
  const descDisplay = document.createElement("p");
  const weatherEmoji = document.createElement("p");

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
  weatherEmoji.classList.add("weatherEmoji");

  card.appendChild(cityDisplay);
  card.appendChild(tempDisplay);
  card.appendChild(humidityDisplay);
  card.appendChild(descDisplay);
  card.appendChild(weatherIcon);
}

function displayForecastInfo(forecastData) {
  const forecastContainer = document.createElement("div");
  forecastContainer.classList.add("forecastContainer");

  // Slice 8 timestamps (3-hour intervals)
  const sliced = forecastData.list.slice(0, 8);

  let lastDay = null;

  sliced.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" }); // e.g. Mon, Tue
    const today = new Date();

    // Decide label for day
    let dayLabel;
    if (date.toDateString() === today.toDateString()) {
      dayLabel = "Today";
    } else {
      // Check if tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) {
        dayLabel = "Tomorrow";
      } else {
        dayLabel = dayName;
      }
    }

    // Add day separator if new day
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
      <img src="${iconUrl}" alt="" />
      <p>${temp}</p>
    `;

    forecastContainer.appendChild(forecastItem);
  });

  card.appendChild(forecastContainer);
}

function displayError(message) {
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");
  card.textContent = "";
  card.style.display = "flex";
  card.appendChild(errorDisplay);
}

function getWeatherByCoords(lat, lon) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  Promise.all([fetch(currentUrl), fetch(forecastUrl)])
    .then(async ([curRes, foreRes]) => {
      if (!curRes.ok || !foreRes.ok) throw new Error("Location fetch failed");
      const current = await curRes.json();
      const forecast = await foreRes.json();
      displayWeatherInfo(current);
      displayForecastInfo(forecast);
    })
    .catch((err) => displayError("Location weather not available"));
}
window.getWeatherByCoords = getWeatherByCoords;

function showLoader(show) {
  if (show) {
    loader.style.display = "block";
    card.style.display = "flex";
    card.textContent = "";
  } else {
    loader.style.display = "none";
  }
}

function updateTimeDate() {
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");

  if (!timeEl || !dateEl) return;

  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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

document.addEventListener("DOMContentLoaded", () => {
  updateTimeDate();
  setInterval(updateTimeDate, 1000);
});
