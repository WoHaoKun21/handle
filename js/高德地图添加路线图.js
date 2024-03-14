let map; // 地图对象
const addLine = document.getElementById("addLine");

const lineData = [
  [120.023775, 29.96747],
  [120.023435, 29.966754],
  [120.023911, 29.966359],
  [120.023999, 29.965693],
  [120.023979, 29.964548],
  [120.024047, 29.964514],
  [120.024563, 29.965331],
  [120.025049, 29.965373],
  [120.025, 29.965491],
  [120.024728, 29.965803],
  [120.024825, 29.966039],
  [120.025029, 29.966384],
  [120.025593, 29.966333],
  [120.025865, 29.966291],
  [120.026546, 29.966813],
  [120.027518, 29.96646],
  [120.028063, 29.966022],
  [120.028685, 29.965853],
  [120.028957, 29.96582],
  [120.029472, 29.965946],
  [120.029482, 29.966426],
  [120.028685, 29.966527],
  [120.028218, 29.966797],
  [120.027674, 29.967209],
  [120.027586, 29.967647],
  [120.027683, 29.968077],
  [120.027635, 29.968304],
  [120.027188, 29.968153],
  [120.026614, 29.967858],
  [120.026235, 29.967984],
  [120.025768, 29.967959],
  [120.025234, 29.967816],
  [120.024679, 29.967807],
  [120.02432, 29.967833],
  [120.023979, 29.96774],
];
// 初始化地图
const initMap = () => {
  map = new AMap.Map("container", {
    zoom: 18,
    center: [120.025599, 29.966747],
    resizeEnable: true,
    showLabel: true,
    layers: [new AMap.TileLayer.RoadNet({}), new AMap.TileLayer.Satellite()],
  });

  map.on("click", ({ lnglat }) => {
    console.log(lnglat.lng);
    console.log(lnglat.lat);
  });
};

initMap();

// 节点点击事件
const nodeClick = (e, num) => {
  // 在点击事件中创建弹框
  var infoWindow = new AMap.InfoWindow({
    content: `<div style="background: #f00; padding: 10px;">这是${num}个弹框</div>`,
    offset: new AMap.Pixel(0, -10), // 设置弹框偏移量，可根据需要调整
  });

  // 在点击事件中打开弹框
  infoWindow.open(map, e.lnglat);
};

// 添加路线——————驾车路线图
const addLineRange = () => {
  const walking = new AMap.Walking({ map }); //构造驾车导航类
  const startPoint = new AMap.LngLat(lineData[0][0], lineData[0][1]);
  const endPoint = new AMap.LngLat(
    lineData[lineData.length - 1][0],
    lineData[lineData.length - 1][1]
  );
  walking.search(startPoint, endPoint, function (status, result) {
    if (status === "complete") {
      var path = result.routes[0].steps; // 获取路线的节点数组
      const pathLine = [];
      // 遍历节点数组，创建折线并添加到地图上显示
      for (var i = 0; i < lineData.length; i++) {
        const lngLat = new AMap.LngLat(lineData[i][0], lineData[i][1]);
        pathLine.push(lngLat);
      }
      pathLine.push(startPoint);
      path[0].path = pathLine;
    }
  });

  const circleMarker = new AMap.CircleMarker({
    center: lineData[9],
    radius: 10,
    strokeColor: "#f00",
    strokeWeight: 0,
    fillColor: "#fff",
    fillOpacity: 1,
    zIndex: 55,
    cursor: "pointer",
    clickable: true,
  });
  circleMarker.setMap(map);
};

// 添加路线——————Polyline折线
const addLineRange2 = () => {
  new AMap.Polyline({
    map: map,
    path: [...lineData, lineData[0]],
    strokeColor: "#3366FF",
    strokeWeight: 5,
  });
  for (let i = 0; i < lineData.length; i++) {
    const circleMarker = new AMap.CircleMarker({
      center: lineData[i],
      radius: 4,
      strokeColor: "#000",
      strokeWeight: 0,
      fillColor: "#fff",
      fillOpacity: 1,
      zIndex: 55,
      cursor: "pointer",
      clickable: true,
    });
    circleMarker.setMap(map);
    circleMarker.on("click", (e) => nodeClick(e, i + 1));
  }
};

addLine.onclick = addLineRange2;
