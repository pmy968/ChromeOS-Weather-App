const lat = 43.1117;
const lon = -88.4993;
const nwsProxy = 'https://nws-alerts-proxy.onrender.com';
const airQualityApiKey = '784ff07fc3d42cf252a202c28df0e817'; // Replace with your IQAir API key

// Dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Fetch current conditions and forecast
async function getWeather() {
  const pointResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
  const pointData = await pointResponse.json();
  const forecastUrl = pointData.properties.forecast;
  const observationStationsUrl = pointData.properties.observationStations;

  // Get forecast
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();
  displayForecast(forecastData.properties.periods);

  // Get current conditions
  const stationsResponse = await fetch(observationStationsUrl);
  const stationsData = await stationsResponse.json();
  const firstStation = stationsData.properties.stations[0];
  const obsResponse = await fetch(`${firstStation}/observations/latest`);
  const obsData = await obsResponse.json();
  displayCurrentConditions(obsData.properties);
}

// Display current conditions
function displayCurrentConditions(data) {
  const currentDiv = document.getElementById('current-conditions');
  currentDiv.innerHTML = `
    <h2>Current Conditions</h2>
    <p><strong>Temperature:</strong> ${data.temperature.value} °C</p>
    <p><strong>Wind:</strong> ${data.windDirection.value}° at ${data.windSpeed.value} m/s</p>
    <p><strong>Humidity:</strong> ${data.relativeHumidity.value}%</p>
    <p><strong>Conditions:</strong> ${data.textDescription}</p>
  `;
}

// Display forecast
function displayForecast(periods) {
  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = '<h2>7-Day Forecast</h2>';
  periods.forEach(period => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <h3>${period.name}</h3>
      <img src="${period.icon}" alt="${period.shortForecast}">
      <p>${period.temperature}° ${period.temperatureUnit}</p>
      <p>${period.shortForecast}</p>
    `;
    card.addEventListener('click', () => {
      alert(`${period.name}: ${period.detailedForecast}`);
    });
    forecastDiv.appendChild(card);
  });
}

// Fetch air quality data
async function getAirQuality() {
  try {
    const airResponse = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${airQualityApiKey}`);
    const airData = await airResponse.json();
    const aqi = airData.data.current.pollution.aqius;
    const airDiv = document.getElementById('air-quality-data');
    airDiv.innerHTML = `
      <p><strong>Air Quality Index (US):</strong> ${aqi}</p>
      <p><strong>Main Pollutant:</strong> ${airData.data.current.pollution.mainus}</p>
    `;
  } catch (error) {
    const airDiv = document.getElementById('air-quality-data');
    airDiv.innerHTML = '<p>Unable to load air quality data.</p>';
    console.error('Air quality fetch error:', error);
  }
}

// Fetch and display alerts
async function getAlerts() {
  const alertResponse = await fetch(`${nwsProxy}/alerts?lat=${lat}&lon=${lon}`);
  const alertData = await alertResponse.json();
  const alertsDiv = document.getElementById('alerts');

  if (alertData.features.length === 0) {
    alertsDiv.innerHTML += '<p>No active alerts.</p>';
    return;
  }

  alertData.features.forEach(alert => {
    const alertEl = document.createElement('div');
    alertEl.className = 'alert';
    alertEl.innerHTML = `
      <h3>${alert.properties.event}</h3>
      <p>${alert.properties.headline}</p>
      <p>${alert.properties.description}</p>
    `;
    alertsDiv.appendChild(alertEl);
  });
}

// Load all data
getWeather();
getAirQuality();
getAlerts();
