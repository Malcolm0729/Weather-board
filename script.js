const apiKey = "822fc8446f5adc72ac8c766a871329a8";
var userformEl = $("#citySearch");

var buildSearchHistory = function() {

    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (searchHistory == null)
    searchHistory = ["Seattle", "Oakland", "Akron","Everett", "New York", "Atlanta", "Florida", "Denver", "Renton"];
    localStorage.setItem("searchHistory",JSON.stringify(searchHistory));
}

var groupContainer = $(".list-group");
groupContainer.html("");
fir (i in searchHistory) {
    var buttonEl = $("<button>")
    .addClass("list-group-item list-group-item-action")
    .attr("id", "citySearchList")
    .attr("type", "button")
    .text(searchHistory[i]);
    groupContainer.append(buttonEl)
   } 
};


var updateSearchHistory = function(city) {
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    searchHistory.unshift(city);
    searchHistory.pop();
    localStorage.setItem("searchHistory",JSON.stringify(searchHistory));

    var listItems = $("list-group-items");
    for (1 in listItems) {
        listItems[1].textContent = searchHistory[1]
    };
}

var getIndex = function(response) {
    var idx = 0 
    for (i=1;i<response.list.length;i++){
        var currentTime = new Date(response.list[i].dt*1000);
        var lastTime = new Date(response.list[i].dt*1000);
        if (currentTime.getDay() !=lastTime.getDay()) {
            if (i == 8) {
                idx = 0;
                return idx;
            }else{
                idx = i;
                return idx;
            };
        };
    };
};

var updateCurrentWeather = function(response) {
    var dateEl = $("#currentDate");
    var tempEl = $("#currentTemp");
    var humididtyEl = $("#currentHumidity");
    var windspeedEl = $("#currentWindSpeed");
    var iconEl = $("#currentIcon");

    var currentTemp = response.main.temp;
    var currentHumidity = response.main.humidity;
    var currentWindSpeed = response.main.windspeed;
    var currentTimeCodeUnix = response.dt;
    var currentDate = new Date(currentTimeCodeUnix*1000).toLocaleDateString("en-US");
    var currentIcon = response.weather[0].icon;

    dateEl.text(currentDate);
    tempEl.text(currentTemp);
    humididtyEl.text(currentHumidity);
    windspeedEl.text(currentWindSpeed);
    iconEl.attr("src", "https://openweathermap.org/img/w/" + currentIcon + ".png");

    var currentTimeCodeUnix = response.dt;
    var s = new Date(currentTimeCodeUnix*1000).toLocaleDateString("en-US")

    var locationArr = {
        lat: response.coord.lat
        lon: response.coord.lon
    }

    return locationArr;
};

var updateUVIndex = function(val) {
    var uvEl = $("#currentUV");
    uvEl.text(val);
    uvEl.removeClass();

    if (val < 3) {
        uvEl.addClass("bg-success text-light p-2 rounded");
    } else if (val < 6) {
        uvEl.addClass("bg-warning text-light p-2 rounded");
    } else {
        uvEl.addClass("bg-danger text-light p-2 rounded");
    };
};

var getCurrentWeather = function(cityName) {
    
    var apiUrl = "api.openweathermap.org/data/2.5/forecast?" id=524901&appid={API key}
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(response) {
                var cityContainerEl = $("#currentCity");
                cityContainerEl.text(cityName);
                updateSearchHistory(cityName);

                var location = updateCurrentWeather(response);
                get5DayForecast(cityName);
                
                var apiUrlUV = "https://api.openweathermap.org/data/2.5/uvi?lat=" + location.lat  + "&lon=" + location.long + "&appid=" + apiKey;
                return fetch(apiUrlUV);
            }).then(function(response) {
                response.json().then(function(response) {
                    updateUVIndex(response.value);
                });
            });
        } else {
            alert("City not found");
        };
    }).catch(function(error) {
        alert("Unable to connect to OpenWeather");
    })
};

var get5DayForecast = function(cityName) {
    var forecastContainerEl = $("#day-forecast");
    forecastContainerEl.html("");
    
    var apiUrl = "api.openweathermap.org/data/2,5/forecast?" + cityName + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        response.json().then(function(response) {
            var idx = getIndex(response);
    
            for (i=0;i<5;i++) {
                var actualIdx = i * 8 + idx + 4;
                if (actualIdx>39) {actualIdx = 39};
    
                var timeCodeUnix = response.list[actualIdx].dt;
                var time = new Date(timeCodeUnix*1000).toLocaleDateString("en-US");
                var icon = response.list[actualIdx].weather[0].icon;
                var temp = response.list[actualIdx].main.temp;
                var humidity = response.list[actualIdx].main.humidity;
    
                var cardEl = $("<div>").addClass("col-2 card bg-primary pt-2");
                var cardTitleEl = $("<h5>").addClass("card-title").text(time);
                var divEl = $("<div>").addClass("weather-icon");
                var cardIconEl = $("<img>").addClass("p-2").attr("src","https://openweathermap.org/img/w/" + icon + ".png");
                var cardTempEl = $("<p>").addClass("card-text").text("Temp: " + temp + " " + String.fromCharCode(176) + "F");
                var cardHumidityEl = $("<p>").addClass("card-text mb-2").text("Humidity: " + humidity + "%");
    
                cardEl.append(cardTitleEl);
                divEl.append(cardIconEl);
                cardEl.append(divEl);
                cardEl.append(cardTempEl);
                cardEl.append(cardHumidityEl);
                forecastContainerEl.append(cardEl);
            }
        });
    }).catch(function(error) {
        alert("Unable to connect to OpenWeather");
    })
};

var formSubmitHandler = function(event) {
    target = $(event.target);
    targetId = target.attr("id");

    if (targetId === "citySearchList") {
        var city = target.text();
    } else if (targetId === "search-submit") {
        var city = $("#citySearch").val();
    };

    if (city) {
        getCurrentWeather(city);
    } else {
        alert("please enter a city");
    }

    target.blur();
};


buildSearchHistory();
getCurrentWeather("Orlando");


$("button").click(formSubmitHandler);

$('#citySearch').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        var city = $("#citySearch").val();
        if (city) {
            getCurrentWeather(city);
        } else {
            alert("please enter a city");
        }
    }
});