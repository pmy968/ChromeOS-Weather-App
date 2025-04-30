// script.js
const apiKey = 784ff07fc3d42cf252a202c28df0e817;
const location = 'Oconomowoc,WI,US'; // Location: Oconomowoc, WI 53066
const openWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`;
const forecastURL = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&cnt=7&appid=${apiKey}&units=imperial`;
const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=43.0731&lon=-88.5012&appid=${apiKey}`; // Oconomowoc lat/lon
const alertsURL = 'https://api.weather.gov/alerts/';

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('change', toggleDarkMode);

function toggleDarkMode() {
  document.body.classList.toggle('dark', darkModeToggle.checked);
  localStorage.setItem('darkMode', darkModeToggle.checked);
}

// Check saved dark mode setting
if (localStorage.getItem('darkMode') === 'true') {
  darkModeToggle.checked = true;
  document.body.classList.add('dark');
}

// Fetch and display current weather
function fetchCurrentWeather() {
  fetch(openWeatherURL)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('currentData').innerHTML = `${data.main.temp}°F, ${data.weather[0].description}`;
    });
}

async function loadWeatherAlerts() {
  try {
    const res = await fetch("https://nws-alerts-proxy.onrender.com/nws-alerts");
    const data = await res.json();

    const alerts = data.features.filter(alert => {
      const areaDesc = alert.properties.areaDesc || '';
      return areaDesc.includes("Waukesha") || areaDesc.includes("Oconomowoc");
    });

    const alertsContainer = document.getElementById('alerts');
    const alertList = document.getElementById('alert-list');

    if (alerts.length > 0) {
      alertList.innerHTML = ''; // clear any existing alerts
      alerts.forEach(alert => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${alert.properties.event}</strong><br>
          <span class="text-sm">${alert.properties.headline}</span>
        `;
        alertList.appendChild(li);
      });
      alertsContainer.classList.remove('hidden');
    } else {
      alertsContainer.classList.add('hidden');
    }
  } catch (error) {
    console.error('Failed to fetch weather alerts:', error);
  }
}

// Fetch and display forecast
function fetchForecast() {
  fetch(forecastURL)
    .then((response) => response.json())
    .then((data) => {
      let forecastHTML = '<ul>';
      data.list.forEach((day) => {
        const date = new Date(day.dt * 1000);
        forecastHTML += `<li>${date.toDateString()}: ${day.temp.day}°F, ${day.weather[0].description}</li>`;
      });
      forecastHTML += '</ul>';
      document.getElementById('forecastData').innerHTML = forecastHTML;
    });
}

// Fetch and display air quality
function fetchAirQuality() {
  fetch(airQualityURL)
    .then((response) => response.json())
    .then((data) => {
      const aqi = data.list[0].main.aqi;
      document.getElementById('aqData').innerHTML = `AQI: ${aqi}`;
    });
}

// Fetch and display weather alerts
function fetchWeatherAlerts() {
  fetch('https://nws-alerts-proxy.onrender.com/nws-alerts') // Replace with your deployed backend URL in production
  .then((response) => response.json())
  .then((data) => {
    let alertsHTML = '<ul>';
    data.features.forEach((alert) => {
      alertsHTML += `<li><strong>${alert.properties.headline}</strong>: ${alert.properties.description}</li>`;
    });
    alertsHTML += '</ul>';
    document.getElementById('alertsData').innerHTML = alertsHTML;
  });
}

// Fetch radar image
function fetchRadarImage() {
  const radarURL = 'https://tilecache.rainviewer.com/v2/radar/2/256/0/0/0/0.png';
  document.getElementById('radarImage').src = radarURL;
}

// Card Interactions
function showHourly() {
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = 'Hourly forecast coming soon...';
  document.getElementById('modal').classList.remove('hidden');
}

function toggleForecastDetails() {
  const forecastData = document.getElementById('forecastData');
  forecastData.style.display = forecastData.style.display === 'none' ? 'block' : 'none';
}

function expandRadar() {
  window.open('https://tilecache.rainviewer.com/v2/radar/2/256/0/0/0/0.png', '_blank');
}

function showAlerts() {
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = 'Weather alerts details coming soon...';
  document.getElementById('modal').classList.remove('hidden');
}

function showAQDetails() {
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = 'Air Quality details coming soon...';
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Initialize the dashboard
fetchCurrentWeather();
fetchForecast();
fetchAirQuality();
fetchWeatherAlerts();
fetchRadarImage();
