var form = document.querySelector(".top-banner form");
var input = document.querySelector(".top-banner input");
var msg = document.querySelector(".top-banner .msg");
var list = document.querySelector(".ajax-section .cities");
var apiKey = "7e4df5175ac8eb30072fedd3ef48f997";

form.addEventListener("submit", (e) => {
  e.preventDefault();
  var listItems = list.querySelectorAll(".ajax-section .city");
  var inputVal = input.value;

  var url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var { main, name, sys, weather } = data;
      var icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;
      // var uvIndex = `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

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
    })
    .catch(() => {
      msg.textContent = "Please search for a valid city";
    });

  msg.textContent = "";
  form.reset();
  input.focus();
});
