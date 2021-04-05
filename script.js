var form = document.querySelector(".top-banner form");
var input = document.querySelector(".top-banner input");
var msg = document.querySelector(".top-banner .msg");
var list = document.querySelector(".ajax-section .cities");
var searchHistory = document.querySelector(".list-group");
var fiveDayForecast = document.querySelector(".fiveDayForecast");
var apiKey = "7e4df5175ac8eb30072fedd3ef48f997";
var namesArray = [];

// var currentDate = new Date();
// document.getElementById("currentDate").innerHTML = currentDate.toDateString();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  list.innerHTML = "";
  var inputVal = input.value;
  var countryCode = "";
  // The weather endpoint will be used to get the lat & lon tbe able to get forecast from oenCall Endpoint
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&exclude=hourly&cnt=5&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((response) => response.json()) // pass the data as promise to next then block
    .then((data) => {
      var lat = data.coord.lat;
      var lon = data.coord.lon;

      var { main, name, sys, weather } = data;
      countryCode = sys.country;

      // Create the Card to display the current Weather Conditions
      //----------------------------------------------------------------------
      var icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;
      var li = document.createElement("li");
      li.classList.add("city");
      var markup = `
        <h2 class="city-name" data-name="${name},${sys.country}">
          <span>${name}</span>
          <sup>${sys.country}</sup>
        </h2>
        <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
        <figure>
          <img class="city-icon" src=${icon} alt=${weather[0]["main"]}>
          <caption>${weather[0]["description"]}</caption>
        </figure>
      `;
      li.innerHTML = markup;
      list.appendChild(li);

      // Create a Button ---------------------------------------------
      var li2 = document.createElement("button");
      li2.classList.add("history");
      var markup2 = `<li><button class = "list-group-item" id="${name}">${name}</button></li>`;
      li2.innerHTML = markup2;
      li2.addEventListener("click", (e) => {
        // console.log("You clicked me " + e.target.id );
        list.innerHTML = "";
        var cityName = e.target.id;
        var weatherCard = localStorage.getItem(cityName);
        var liFromLocal = document.createElement("li");
        liFromLocal.classList.add("city");
        liFromLocal.innerHTML = weatherCard;
        list.appendChild(liFromLocal);

        // Need to draw associated Forecast
        var forecastKey = cityName + "Forecast";
        var forecastDataFromStorage = localStorage.getItem(forecastKey);

        var forecastData = JSON.parse(forecastDataFromStorage);

        var sixDaysForecast = getFiveDayForecastPlusCurrent(
          forecastData,
          cityName,
          countryCode
        );

        drawCards(sixDaysForecast);
      });
      // End of Button Creation --------------------------------------

      // Prevent adding city more than once to the history
      if (!namesArray.includes(name)) {
        namesArray.push(name);
        searchHistory.appendChild(li2);
        // save the city name and it's associated weather information
        localStorage.setItem(name, markup);
      }

      return fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=metric`
      );
      // make a 2nd request and return a promise
    })
    .then((response) => response.json()) // This is the forecast data
    .then((data) => {
      var sixDaysForecast = getFiveDayForecastPlusCurrent(
        data,
        inputVal,
        countryCode
      );

      localStorage.setItem(
        sixDaysForecast[0].city + "Forecast",
        JSON.stringify(data)
      );
      // Need to draw the 6 card
      drawCards(sixDaysForecast);
    })
    .catch(() => {
      msg.textContent = "Please search for a valid city";
    });

  msg.textContent = "";
  form.reset();
  input.focus();
});

function getFiveDayForecastPlusCurrent(forecastData, city, countryCode) {
  var forecast = [];
  var oneDayForecast = {};
  for (i = 0; i < 6; i++) {
    oneDayForecast = {}; // Create JSON Object
    oneDayForecast["dayOfWeek"] = unixTimeStampConverter(
      forecastData.daily[i].dt,
      "DayOfWeek"
    );
    oneDayForecast["Month"] = unixTimeStampConverter(
      forecastData.daily[i].dt,
      "Month"
    );
    oneDayForecast["city"] = city;
    oneDayForecast["country"] = countryCode;
    oneDayForecast["temp"] = forecastData.daily[i].temp.day; // Temperature during the day
    oneDayForecast["humidity"] = forecastData.daily[i].humidity;
    oneDayForecast["wind_speedforecastData"] = forecastData.daily[i].wind_speed;
    oneDayForecast["uvi"] = forecastData.daily[i].uvi;
    oneDayForecast["WeatherMain"] = forecastData.daily[i].weather[0].main;
    oneDayForecast["WeatherIcon"] = forecastData.daily[i].weather[0].icon;
    oneDayForecast["WeatherDescription"] =
      forecastData.daily[i].weather[0].description;

    forecast.push(oneDayForecast);
  }
  return forecast;
}

// Function to Convert unixTimestamp to current Date
// UNIX Time Stamp is the number of seconds from 1970 to date
function unixTimeStampConverter(unixTime, format) {
  var milliseconds = unixTime * 1000;
  const dateObject = new Date(milliseconds);

  if ((format = "Month"))
    return dateObject.toLocaleString("en-US", { weekday: "long" });
  //2019-12-9 10:30:15
  else {
    return dateObject.toLocaleString("en-US", { weekday: "long" }); //2019-12-9 10:30:15
  }
}

function drawCards(cardDataArray) {
  // console.log(cardDataArray);

  // cardDataArray has 6 elements
  // first element is the cureent conditions
  // the next 5 elements have data for cards of forecast
  // console.log(cardDataArray[0]);

  var oneCardMarkup;
  var oneCardData;
  var iconName;
  var icon;

  fiveDayForecast.innerHTML = "";
  // console.log("Inside Draw Card");
  // console.log(cardDataArray);

  for (i = 1; i <= 5; i++) {
    var li3 = document.createElement("li");
    li3.classList.add("fiveDays");
    oneCardData = cardDataArray[i];
    console.log(oneCardData);
    iconName = oneCardData.WeatherIcon;
    console.log(iconName);

    // console.log("See one card Data");
    // console.log(oneCardData);
    icon =
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" +
      iconName +
      ".svg";

    //   oneCardMarkup = `<ul class = "fiveDayCast">
    //   <h4 class="day-of-week">${oneCardData.dayOfWeek}</h4>
    //   <div class="city-temp">${Math.round(oneCardData.temp)}<sup>°C</sup></div>
    //   <h5 class="humidity">Humidity: ${Math.round(oneCardData.humidity)}</h5>
    //   <h5 class="windspeed">UV: ${Math.round(oneCardData.uvi)}</h5>
    //   <figure>
    //     <img class="city-icon" src=${icon} alt=${oneCardData.WeatherMain}>
    //     <caption>${oneCardData.WeatherDescription}</caption>
    //   </figure> </ul>
    // `;

    if (Math.round(oneCardData.uvi < 5)) {
      // console.log("Im low");
      oneCardMarkup = `<ul class = "fiveDayCast">
  <h4 class="day-of-week">${oneCardData.dayOfWeek}</h4>
  <div class="city-temp">${Math.round(oneCardData.temp)}<sup>°C</sup></div>
  <h5 class="humidity">Humidity: ${Math.round(oneCardData.humidity)}</h5>
  <h5 class="uvi" style="color: green">UV: ${oneCardData.uvi}</h5>
  <h5 class="windspeed">Windspeed: ${
    oneCardData.wind_speedforecastData
  } m/s</h5>
  <figure>
    <img class="city-icon" src=${icon} alt=${oneCardData.WeatherMain}>
    <caption>${oneCardData.WeatherDescription}</caption>
  </figure> </ul>    
`;
    } else if (oneCardData.uvi >= 5 && oneCardData.uvi <= 6) {
      // console.log("I'm normal");
      oneCardMarkup = `<ul class = "fiveDayCast">
      <h4 class="day-of-week">${oneCardData.dayOfWeek}</h4>
      <div class="city-temp">${Math.round(oneCardData.temp)}<sup>°C</sup></div>
      <h5 class="humidity">Humidity: ${Math.round(oneCardData.humidity)}</h5>
      <h5 class="uvi" style="color: #ce7b16">UV: ${oneCardData.uvi}</h5>
      <h5 class="windspeed">Windspeed: ${
        oneCardData.wind_speedforecastData
      } m/s</h5>
      <figure>
        <img class="city-icon" src=${icon} alt=${oneCardData.WeatherMain}>
        <caption>${oneCardData.WeatherDescription}</caption>
      </figure> </ul>
    `;
    } else {
      // console.log("Im high");
      oneCardMarkup = `<ul class = "fiveDayCast">
  <h4 class="day-of-week">${oneCardData.dayOfWeek}</h4>
  <div class="city-temp">${Math.round(oneCardData.temp)}<sup>°C</sup></div>
  <h5 class="humidity">Humidity: ${Math.round(oneCardData.humidity)}</h5>
  <h5 class="uvi" style="color: red">UV: ${oneCardData.uvi}</h5>
  <h5 class="windspeed">Windspeed: ${
    oneCardData.wind_speedforecastData
  } m/s</h5>
  <figure>
    <img class="city-icon" src=${icon} alt=${oneCardData.WeatherMain}>
    <caption>${oneCardData.WeatherDescription}</caption>
  </figure> </ul>    
`;
    }

    li3.innerHTML = oneCardMarkup;
    fiveDayForecast.appendChild(li3);
  }
}
