let satelliteLayer; // 卫星图层变量

const pathArr = [
  [119.891165, 28.450029, 2],
  [119.89475, 28.474768, 1],
  [119.900461, 28.478032, 1],
  [119.906131, 28.476711, 1],
  [119.916231, 28.475365, 1],
  [119.926563, 28.474011, 1],
  [119.933019, 28.474496, 1],
];

// const dataType = {
//   type: "Feature",
//   properties: {
//     type: 1,
//   },
//   geometry: {
//     type: "LineString",
//     coordinates: [coord, pathArr[index + 1]],
//   },
// };

const jeoJson = {
  type: "FeatureCollection",
  features: pathArr
    .map((coord, index) => ({
      type: "Feature",
      properties: {
        type: index + 1,
        status: coord[2],
      },
      geometry: {
        type: "LineString",
        coordinates: [coord, pathArr[index + 1]],
      },
    }))
    .filter((o, i) => i + 1 !== pathArr.length),
};

const initMap = () => {
  const map = new AMap.Map("container", {
    zoom: 14,
    center: [119.905849, 28.465694],
    resizeEnable: true,
    showLabel: true,
  });

  // 构造卫星图层
  satelliteLayer = new AMap.TileLayer.Satellite();
  map.add(satelliteLayer); // 添加卫星图层

  const loca = new Loca.Container({ map });
  window._loca = loca;

  const geo = new Loca.GeoJSONSource({
    // url: "https://a.amap.com/Loca/static/loca-v2/demos/mock_data/bj_bus.json",
    data: jeoJson,
  });

  const layer = new Loca.PulseLineLayer({
    zIndex: 11,
    opacity: 1,
    visible: true,
    zooms: [2, 22],
  });

  // 设置管道线样式
  layer.setStyle({
    altitude: 0,
    lineWidth: 6,
    // 脉冲头颜色
    headColor: (_, feature) => {
      if (feature.properties.status === 1) {
        return "#34eaeb";
      }
      return "#cecece";
    },
    // 脉冲尾颜色
    trailColor: (_, feature) => {
      return "rgba(128, 128, 128, 0.5)";
    },
    // 脉冲长度，0.25 表示一段脉冲占整条路的 1/4
    interval: 0.5,
    // 脉冲线的速度，几秒钟跑完整段路
    duration: 10000,
  });

  // 设置数据源
  layer.setSource(geo);
  loca.add(layer);
  loca.animate.start();
  map.on("click", ({ lnglat }) => {
    console.log(lnglat.lng);
    console.log(lnglat.lat);
  });
};

initMap();
