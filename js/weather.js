const geolocation = (navigator.geolocation) ? true : false;
const other_days = document.querySelector('.other-days');
const location_date = document.querySelector('.location-date');
const location_timezone = document.querySelector('.location-timezone');
const temperature_degree = document.querySelector('.temperature-degree');
const temperature_description = document.querySelector('.temperature-description');
const page_content = document.querySelector('#page-content');
const canvas = document.querySelector('.weather-icon canvas');
const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']; 
const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wedday', 'Thursday', 'Friday', 'Saturday']; 
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']; 

function isLoading() {
    document.getElementById("overlay").style.display = "block";
}

function hasLoaded() {
    document.getElementById("overlay").style.display = "none";
}

page_content.addEventListener('click', function(e) {
    const target = e.target;
    if (target.classList.contains('degree')) {
        const conversion = convertTemp(target.dataset.value);
        target.dataset.value = conversion;
        target.textContent = conversion;
    }
    
});

if (geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        long = position.coords.longitude;
        lat = position.coords.latitude;     
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        const api = `${proxy}https://api.darksky.net/forecast/11b90abc65f2670e5d504ba4ff0e0822/${lat},${long}`;
        return fetchWeatherData(api);
    }, function() {
        page_content.innerHTML = `<h5>This app needs location enabled</h5>`;
    });
} else {
    page_content.innerHTML = `<h5>Your device does not support geolocation</h5>`;
}



function fetchWeatherData(api) {
    isLoading();
    return fetch(api)
    .then( response => response.json() )
    .then(data => {
        const {temperature, summary, icon, time} = data.currently;
        const temp = Math.ceil(temperature);
        const location = data.timezone.split("/");
        const country = location[1];
        const continent = location[0];
        temperature_degree.textContent = `${temp}°F`;
        temperature_degree.dataset.value = `${temp}°F`;
        canvas.dataset.icon = icon;
        temperature_description.textContent = summary;
        const date = unixToDate(time);
        location_timezone.innerHTML = `<span class="font-size-30">${country}, </span>${continent}`;
        location_date.innerHTML = `<span class="font-size-30">${fullDays[date.getDay()]} ${months[date.getMonth()]}, ${date.getDate()} ${date.getFullYear()} </span>`;
        setOtherDays(data.daily.data).then(() => {
            document.querySelectorAll('.icon').forEach(ele => {
                setIcons(ele.dataset.icon, ele);
            });
        });
    })
    .catch(e => {
        page_content.innerHTML = `<h5>Could not fetch data. Try Later</h5>`;
        console.warn('Error', e);
    })
    .finally(() => hasLoaded());
}

function setIcons(icon, ele) {
    const skycons = new Skycons({"color": "white"});
    const ICON = icon.replace(/-/g, '_').toUpperCase();
    // start animation!
    skycons.play();
    skycons.set(ele, Skycons[ICON]);
}

function convertTemp(temperature) {
    const value = parseInt(temperature.split('°')[0]);
    if (temperature.includes('°F')) {
        return `${convertToCelsius(value)}°C`;
    }
    return `${convertToFarenhite(value)}°F`;
}

async function setOtherDays(datas) {
    const length = datas.length - 1;
    for (let index = 1; index < length; index++) {
        const {temperatureMax, temperatureMin, icon, time} = datas[index];
        const temp = Math.floor((temperatureMax + temperatureMin) / 2);
        const day = unixToDate(time).getDay();
        const dayName = days[day];
        other_days.innerHTML += `<div class="col-2">
            <div>
                <div class="mb-10">${dayName}</div>
                    <canvas class="icon" data-icon="${icon}" width="50" height="50"></canvas>
                <div class="degree" data-value="${temp}°F">${temp}°F</div>
            </div>
        </div>`;
    }
    return;
}

function unixToDate(unix) {
    return new Date(unix * 1000);
}

function convertToCelsius(value) {
    return Math.floor((value - 32) * (5 / 9));
}

function convertToFarenhite(value) {
    return Math.ceil((value * 9 / 5) + 32);
}
