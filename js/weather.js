const weatherDom = document.getElementById("weather");
const buttonDom = document.getElementById("button");
const keyArr = [
  "cd87751e1d7c3dd187bbaaf5d8cadfa4",
  "6f07ecc5ec417425ac2989f9ed792690",
  "48fbb6a74b5e43ad284b5933cf1aa102",
  "088a2982460b0b42c5dbbce17ad4d065",
  "e0b424a50b8133ffc7e209db145a83cb",
];

buttonDom.onclick = () => {
  fetch(
    "https://restapi.amap.com/v3/weather/weatherInfo?key=e0b424a50b8133ffc7e209db145a83cb&city=110000&extensions=all"
  )
    .then((r) => r.json())
    .then((data) => {
      console.log("天气数据：", data);
    });
};
