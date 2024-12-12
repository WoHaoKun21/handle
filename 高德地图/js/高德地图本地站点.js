window._AMapSecurityConfig = {
  securityJsCode: "16f81296c450f8bb5149a86056dae9c8",
};
let map;

// 初始化地图
const initMap = () => {
  map = undefined;
  const container = document.getElementById("map");
  if (container) {
    // 清除挂载点里面的内容，防止重复挂载
    container.innerHTML = "";
  }
  AMapLoader.load({
    key: "514c99148afec38a187b745ddbd1e517",
    version: "2.0", //指定要加载的 JS API 的版本，不加时默认为 1.4.15
    plugins: [
      "Map3D",
      "AMap.Scale",
      "AMap.ToolBar",
      "AMap.MouseTool",
      "AMap.PolyEditor",
      "AMap.PlaceSearch",
      "AMap.Autocomplete",
      "AMap.DistrictSearch",
      "AMap.MarkerClusterer",
    ],
    //是否加载 Loca， 不会自动加载
    Loca: { version: "2.0" },
    //是否加载 AMapUI，不自动加载
    AMapUI: {
      version: "1.1", //AMapUI 版本
      plugins: ["overlay/SimpleMarker"], // ui 插件
    },
  })
    .then((AMap) => {
      map = new AMap.Map(container, {
        zoom: 14,
        zooms: [5, 18], // 缩放范围
        resizeEnable: true,
        showLabel: true, // 不显示地图文字标记
        center: [119.905849, 28.465694],
      });
      // 构造卫星图层
      satelliteLayer = new AMap.TileLayer.Satellite();
      map.add(satelliteLayer); // 添加卫星图层
      mapMask(AMap); // 地图遮罩层
      getMapData(); // 获取地图数据，生成地图标注
    })
    .catch((e) => {
      console.log(e);
    });
};

// 生成遮罩层
const mapMask = (AMap) => {
  // 获取城市信息并进行过遮罩
  new AMap.DistrictSearch({
    extensions: "all",
    subdistrict: 0,
  }).search("莲都区", function (status, result) {
    // 外多边形坐标数组和内多边形坐标数组
    const outer = [
      new AMap.LngLat(-360, 90, true),
      new AMap.LngLat(-360, -90, true),
      new AMap.LngLat(360, -90, true),
      new AMap.LngLat(360, 90, true),
    ];
    const holes = result.districtList[0].boundaries;
    const pathArray = [outer];
    pathArray.push(holes[0]);
    const polygon = new AMap.Polygon({
      pathL: pathArray,
      strokeColor: "#99ffff",
      strokeWeight: 4,
      strokeOpacity: 0.5,
      fillColor: "#fff",
      fillOpacity: 0.3,
    });
    polygon.setPath(pathArray);
    map.add(polygon); // 遮罩区域
  });
};

// 获取地图数据
const getMapData = async () => {
  const pathLine = []; // 存储闸门站点坐标
  const res = await fetch("./json/高德地图点聚合.json").then((r) => r.json());
  const { waterStation, rainStation, jkStation, zkStation } = res;
  map.getAllOverlays().forEach((item) => {
    if (item.CLASS_NAME === "AMap.Marker") return item.remove();
  });
  console.log("数据结构：", res);
  // 生成水位标注
  if (zkStation && zkStation.length > 0) {
    zkStation.map((item) => {
      const marker = createIcon(item, "water");
      marker.on("click", (e) => {
        const position = e.target.getPosition();
        map.setZoomAndCenter(18, [position.lng, position.lat]);
      });
    });
  }
};

// 生成地图标注
const createIcon = (obj = {}, type) => {
  const { id, lng, lat, status } = obj;
  const html = ` <div class="cstm-icon-panel" id="icon-${id}"}>
      <div class="cstm-icon-img">
          <img src="./img/dwImg.png" style="width: 30;" />
      </div>
    </div>`;
  const marker = new AMap.Marker({
    map,
    content: html,
    position: [lng, lat],
    offset: new AMap.Pixel(-22, -37),
  });
  return marker;
};

// 生成给地图弹框
const mapPopup = () => {
  const { name, status } = obj;
  return `<div>${name}</div>`;
};

// 生成地图管道流向图
const mapPipe = () => {};

initMap();
