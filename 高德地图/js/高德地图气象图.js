let map; // 地图实例
let heatmap; // 气象图层
let satelliteLayer; // 卫星底图

// 通过canvas生成气象图层，饼添加到地图
const initHeatMap = async () => {
  const res = await fetch(
    "http://211.90.240.131:8081/qx/getData?dataTime=2025-04-01 14:00&type=t2"
  ).then((res) => res.json());

  if (res.code == 200) {
    // 生成heatmap对象
    heatmap = new AMap.HeatMap(map, {
      radius: 25, // 给定半径
      opacity: [0, 0.8],
      "3d": {
        heightScale: 1,
        heightBezier: [0.5, 0.1, 0.5],
        gridSize: 9000,
      },

      //   gradient: { 0.5: "blue", 0.65: "rgb(117,211,248)", 0.7: "rgb(0, 255, 0)", 0.9: "#ffea00", 1.0: "red" },
    });
    const arr = res.data.map((o) => ({
      lng: o.lon,
      lat: o.lat,
      count: o.value,
    }));
    console.log("数据：", arr);
    // 设置数据集
    heatmap.setDataSet({ data: arr, max: 100 });
  }
};

// 初始化地图
const initMap = () => {
  map = new AMap.Map("container", {
    zoom: 10, //设置当前显示级别
    zooms: [5, 18], // 缩放范围
    animateEnable: true,
    center: [119.820345878417969, 30.0343912775878906],
  });
  // 构造卫星图层
  satelliteLayer = new AMap.TileLayer.Satellite();
  //   map.add(satelliteLayer); // 添加卫星图层
  initHeatMap();
  map.on("click", ({ lnglat }) => {
    console.log("lnglat：", [lnglat.lng, lnglat.lat]);
  });
};

initMap();

const showHeatmap = () => heatmap.show();

const hideHeatmap = () => heatmap.hide();

document.getElementById("show-btn").onclick = showHeatmap;
document.getElementById("hide-btn").onclick = hideHeatmap;
