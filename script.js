// Configuration
const location = {
  city: "Oconomowoc",
  state: "WI",
  lat: 43.1117,
  lon: -88.4993
};

const proxyUrl = "https://nws-alerts-proxy.onrender.com";

// DOM Elements
const toggleDarkModeBtn = document.getElementById("dark-mode-toggle");
const alertsContainer = document.getElementById("alerts");
const forecastContainer = document.getElementById("forecast");
const currentConditionsContainer = document.getElementById("current-conditions");

// Toggle Dark Mode
toggleDarkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleDarkModeBtn.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
});

// Fetch Functions
async function fetchCurrentConditions() {
  const url = `https://api.weather.gov/points/${location.lat},${location.lon}`;
  const pointRes = await fetch(url);
  const pointData = await pointRes.json();
  const obsUrl = pointData.properties.observationStations;
  const obsRes = await fetch(obsUrl);
  const obsData = await obsRes.json();
  const station = obsData.features[0].properties.stationIdentifier;
  const latestObsUrl = `https://api.weather.gov/stations/${station}/observations/latest`;
  const obs = await fetch(latestObsUrl).then(res => res.json());
  return obs.properties;
}

async function fetchForecast() {
  const forecastUrl = `https://api.weather.gov/points/${location.lat},${location.lon}`;
  const pointRes = await fetch(forecastUrl);
  const pointData = await pointRes.json();
  const url = pointData.properties.forecast;
  const forecast = await fetch(url).then(res => res.json());
  return forecast.properties.periods;
}

async function fetchAlerts() {
  const alertUrl = `${proxyUrl}/alerts?lat=${location.lat}&lon=${location.lon}`;
  const res = await fetch(alertUrl);
  const data = await res.json();
  return data.features || [];
}

// Render Functions
function renderCurrentConditions(data) {
  currentConditionsContainer.innerHTML = `
    <h2>Current Conditions</h2>
    <p><strong>Temperature:</strong> ${data.temperature.value} °F</p>
    <p><strong>Humidity:</strong> ${data.relativeHumidity.value}%</p>
    <p><strong>Wind:</strong> ${data.windSpeed.value} mph ${data.windDirection.value}°</p>
    <p><strong>Condition:</strong> ${data.textDescription}</p>
  `;
}

function renderForecast(forecast) {
  forecastContainer.innerHTML = "<h2>7-Day Forecast</h2>";
  forecast.slice(0, 7).forEach(period => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <h3>${period.name}</h3>
      <p>${period.shortForecast}</p>
      <p>${period.temperature}° ${period.temperatureUnit}</p>
    `;
    card.addEventListener("click", () => {
      alert(`Details:\n\n${period.detailedForecast}`);
    });
    forecastContainer.appendChild(card);
  });
}

function renderAlerts(alerts) {
  alertsContainer.innerHTML = "<h2>Active Alerts</h2>";
  if (alerts.length === 0) {
    alertsContainer.innerHTML += "<p>No active alerts.</p>";
    return;
  }
  alerts.forEach(alert => {
    const alertEl = document.createElement("div");
    alertEl.className = "alert";
    alertEl.innerHTML = `
      <h3>${alert.properties.event}</h3>
      <p>${alert.properties.headline}</p>
    `;
    alertEl.addEventListener("click", () => {
      alert(`${alert.properties.description}\n\nInstructions:\n${alert.properties.instruction}`);
    });
    alertsContainer.appendChild(alertEl);
  });
}

// Main Init Function
async function init() {
  try {
    const [conditions, forecast, alerts] = await Promise.all([
      fetchCurrentConditions(),
      fetchForecast(),
      fetchAlerts()
    ]);
    renderCurrentConditions(conditions);
    renderForecast(forecast);
    renderAlerts(alerts);
  } catch (err) {
    console.error("Error initializing app:", err);
  }
}

init();
