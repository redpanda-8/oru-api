// Utility function to create elements
function createElement(elem, attributes = {}, textContent = '') {
    const element = document.createElement(elem);
    // for loop condition to go thro object and get its key and key value and then apply them correctly as attribute key and value
    // for every step we take one item from an object, make it into array which has two items key:value and 
    // then we can assign them seperately in this case to setAttribute function
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    element.textContent = textContent;
    return element;
  }
  
  // Cache DOM elements
  const app = document.getElementById("app");
  const body = document.querySelector("body");
  
  // Page layout and element creation
  const container = createElement("div", { id: "container" });
  const mainHeader = createElement("h1", {}, "Orų prognozės");
  const selectForm = createElement("form");
  const inputWrapper = createElement("div", { class: "inputWrapper" });
  const selectWrapper = createElement("div", { class: "selectWrapper" });
  const input = createElement("input", { type: "text", placeholder: "Įveskite miesto pavadinimą" });
  const primary = createElement("button", { type: "submit" }, "Pridėti miestą");
  const labelSelect = createElement("label", {}, "Pasirinkite prognozės datą: ");
  const inputSelect = createElement("select", { name: "date" });
  const optionSelect1 = createElement("option", { value: "siandien" }, "Šiandien");
  const optionSelect2 = createElement("option", { value: "rytoj" }, "Rytoj");
  const selectHeader = createElement("h2", {}, "Pridėti miestai");
  
  // CSS class assignments
  container.classList.add("container");
  primary.classList.add("primary");
  
  // Event listeners
  inputSelect.addEventListener("change", () => updateWeather(createRegEx()));
  
  // Locations and weather status
  const locations = ["Kaunas", "Vilnius", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus"];
  // status list from API and images to display on status match 
  const weatherStatus = {
    "clear": "./assets/img/clear.png",
    "partly-cloudy": "./assets/img/partly-cloudy.png",
    "cloudy-with-sunny-intervals": "./assets/img/partly-cloudy.png",
    "cloudy": "./assets/img/cloudy.png",
    "light-rain": "./assets/img/light-rain.png",
    "rain": "./assets/img/rain.png",
    "heavy-rain": "./assets/img/heavy-rain.png",
    "thunder": "./assets/img/thunder.png",
    "isolated-thunderstorms": "./assets/img/thunderstorms.png",
    "thunderstorms": "./assets/img/thunderstorms.png",
    "heavy-rain-with-thunderstorms": "./assets/img/thunderstorms.png",
    "light-sleet": "./assets/img/sleet.png",
    "sleet": "./assets/img/sleet.png",
    "freezing-rain": "./assets/img/sleet.svg",
    "hail": "./assets/img/hail.png",
    "light-snow": "./assets/img/snow.png",
    "snow": "./assets/img/snow.png",
    "heavy-snow": "./assets/img/snow.png",
    "fog": "./assets/img/fog.png",
    "null": "./assets/img/crescent-moon.png",
  };
  
  // Local storage management
  const savedCities = JSON.parse(localStorage.getItem("savedCities")) || [];
  
  // Page rendering functions
  // Render page elements
  function displayPage() {
    selectForm.append(input, primary);
    inputWrapper.append(labelSelect, inputSelect);
    inputSelect.append(optionSelect1, optionSelect2);
    app.append(mainHeader, inputWrapper, container, selectHeader, selectForm, selectWrapper);
  }
  
  // Create wheatherItem 
  function createWetherItem(id, hidden) {
    const item = createElement("div", { id: `city_${id}`, class: "item" });
    const remove = createElement("button", { id, class: "remove" }, "X");
    const city = createElement("h4");
    const temperatureActual = createElement("span", { class: "temp" });
    const temperatureFelt = createElement("span", { class: "jutimine" });
    const conditionImage = createElement("img", { class: "conditionImage" });
  
    remove.addEventListener("click", deleteCard);
  
    if (hidden) remove.style.display = "none";
  
    item.append(remove, city, conditionImage, temperatureActual, temperatureFelt);
  
    return item;
  }
  
  // Render initial localtions 
  function drawItems() {
    locations.forEach(city => {
      const item = createWetherItem(`main_${city}`, true);
      container.appendChild(item);
    });
  }
  // Render items selected by user 
  function drawSavedItems() {
    savedCities.forEach(city => {
      const target = document.getElementById(`city_${city}`);
      if (!target) {
        const item = createWetherItem(city, false);
        selectWrapper.append(item);
      }
    });
  }
  
  // API request to get Data for the locations
  async function updateWeather(timeRegEx) {
    // repeat loop for each city in locations 
    for (let city of locations) {
        // request (res) we call API for data with provided parameters
      const res = await fetch(`https://api.meteo.lt/v1/places/${city}/forecasts/long-term`);
      // request converted thro json so we could use it as an object
      const data = await res.json();
  
      const parentDiv = document.getElementById(`city_main_${city}`);
      const cityName = parentDiv.querySelector("h4");
      const temp = parentDiv.querySelector(".temp");
      const jutimine = parentDiv.querySelector(".jutimine");
      const conditionImage = parentDiv.querySelector("img");
  
      // for eac data point in receved timestamp we place data in correct spots
      data.forecastTimestamps.some(timestamp => {
        // it check if timezone is correct (forecastTimeUtc)
        if (timeRegEx.test(timestamp.forecastTimeUtc)) {
          cityName.textContent = data.place.name;
          temp.innerHTML = `Temperatūra: <span class="tempInfo">${timestamp.airTemperature}</span>`;
          jutimine.innerHTML = `Jutiminė temperatūra: <span class="tempInfo">${timestamp.feelsLikeTemperature}</span>`;
          // get image url from weatherStatus object
          conditionImage.src = weatherStatus[timestamp.conditionCode];
          return true;
        }
      });
    }
  }
  
  async function updateWeatherSelect(timeRegEx) {
    for (let city of savedCities) {
      const res = await fetch(`https://api.meteo.lt/v1/places/${city}/forecasts/long-term`);
      const data = await res.json();
  
      const parentDiv = document.getElementById(`city_${city}`);
      const cityName = parentDiv.querySelector("h4");
      const temp = parentDiv.querySelector(".temp");
      const jutimine = parentDiv.querySelector(".jutimine");
      const conditionImage = parentDiv.querySelector("img");
  
      data.forecastTimestamps.some(timestamp => {
        if (timeRegEx.test(timestamp.forecastTimeUtc)) {
          cityName.textContent = data.place.name;
          temp.innerHTML = `Temperatūra: <span class="tempInfo">${timestamp.airTemperature}</span>`;
          jutimine.innerHTML = `Jutiminė temperatūra: <span class="tempInfo">${timestamp.feelsLikeTemperature}</span>`;
          conditionImage.src = weatherStatus[timestamp.conditionCode];
          return true;
        }
      });
    }
  }
  
  async function addToLocalStorage() {
    const inputCity = input.value.trim();
    const res = await fetch(`https://api.meteo.lt/v1/places/${inputCity}/forecasts/long-term`);
    const data = await res.json();
  
    if (data.place.name.toLowerCase() === inputCity.toLowerCase()) {
      if (!savedCities.includes(data.place.name)) {
        savedCities.push(data.place.name);
        localStorage.setItem("savedCities", JSON.stringify(savedCities));
        drawSavedItems();
        updateWeather(createRegEx());
      } else {
        alert("Toks miestas jau pridėtas");
      }
    } else {
      alert("Tokio miesto nėra");
    }
  
    selectForm.reset();
    input.focus();
  }
  
  // Event Listeners
  selectForm.addEventListener("submit", event => {
    event.preventDefault();
    addToLocalStorage();
  });
  
  inputSelect.addEventListener("change", () => {
    const timeRegEx = createRegEx();
    updateWeather(timeRegEx);
    updateWeatherSelect(timeRegEx);
  });
  
  // Create Regular Expression for the forecast
  function createRegEx() {
    const time = new Date();
    const selectValue = inputSelect.value;
    let timeRegEx;
  
    if (selectValue === "siandien") {
      timeRegEx = new RegExp(`${time.getFullYear()}-${(time.getMonth() + 1).toString().padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')} ${time.getHours().toString().padStart(2, '0')}:..:..`);
    } else if (selectValue === "rytoj") {
      const nextDay = new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1);
      timeRegEx = new RegExp(`${nextDay.getFullYear()}-${(nextDay.getMonth() + 1).toString().padStart(2, '0')}-${nextDay.getDate().toString().padStart(2, '0')} 12:..:..`);
    }
  
    return timeRegEx;
  }
  
  // Delete card from localStorage
  function deleteCard(event) {
    const deleteId = event.target.id;
    savedCities.splice(savedCities.indexOf(deleteId), 1);
    localStorage.setItem("savedCities", JSON.stringify(savedCities));
  
    const cardToDelete = document.getElementById(`city_${deleteId}`);
    cardToDelete.remove();
  }
  
  // Initialize page
  document.addEventListener('DOMContentLoaded', () => {
    displayPage();
    drawItems();
    drawSavedItems();
    const timeRegEx = createRegEx();
    updateWeather(timeRegEx);
    updateWeatherSelect(timeRegEx);
  });
  