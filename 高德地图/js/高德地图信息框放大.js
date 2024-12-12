let map;
let closeBtn;

// 添加遮罩层
const mapMask = () => {
  // 获取城市信息并进行过遮罩
  new AMap.DistrictSearch({
    extensions: "all",
    subdistrict: 0,
  }).search("富阳区", function (status, result) {
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

// 创建icon标注————根据标注来生成不同的站点图标
const createIcon = (obj = {}) => {
  const { id, coord, status, name } = obj;
  const [lng, lat] = coord.split(",");
  const html = `<div class="cstm-icon-panel" id={icon-${id}}>
      <div class="cstm-icon-name">${name}</div>
      <div class="cstm-icon-img">
          <img src="${
            status == 0 ? "./img/dwImg.png" : "./img/errdwlmg.png"
          }" style="width: 40px" />
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

// 添加地图标注——方法1
const addMarker = () => {
  points.map((item) => {
    // 创建Icon
    const marker = createIcon(item, "zk");
    marker.on("click", (e) => {
      const position = e.target.getPosition();
      map.setZoomAndCenter(18, position);
      map.setFitView(
        [marker], // 覆盖物数组
        false, // 动画过渡到制定位置
        [0, -700, 0, 0], // 周围边距，上、下、左、右
        18 // 最大 zoom 级别
      );

      console.log(map.setCenter);
      const infoWindow = new AMap.InfoWindow({
        isCustom: true, //使用自定义窗体
        offset: new AMap.Pixel(0, -65), //位移量
        content: `<div class="pop_zm" id={pop-${item.id}}>
                <div class="pop_content">弹框数据：${item.name}</div>
            </div>`,
      });
      infoWindow.open(map, position);
    });
  });
};

// 添加地图标注——方法2
const addMarker2 = () => {
  points.map((item) => {
    // 创建Icon
    const marker = createIcon(item, "zk");
    marker.on("click", (e) => {
      map.setFitView(
        [marker], // 覆盖物数组
        false, // 动画过渡到制定位置
        [0, -700, 0, 0], // 周围边距，上、下、左、右
        18 // 最大 zoom 级别
      );
      marker.setLabel({
        direction: "top", // 弹框位置
        offset: new AMap.Pixel(0, -20), //设置文本标注偏移量
        content: `<div class='info'>
            <p class="pop_title">${item.name} <span id="closeBtn">X</span></p>
        </div>`, //设置文本标注内容
      });
      document.getElementById("closeBtn").addEventListener("click", () => {
        closePop(marker);
      });
    });
  });
};

// 初始化地图
const initMap = () => {
  map = undefined;
  const container = document.getElementById("container"); // 地图挂载点
  if (container) {
    // 清除挂载点里面的内容，防止重复挂载
    container.innerHTML = "";
  }
  map = new AMap.Map(container, {
    zoom: 10.8,
    zooms: [5, 18], // 缩放范围
    resizeEnable: true,
    showLabel: true, // 显示地图文字标记
    center: [119.820345878417969, 30.0343912775878906],
    layers: [
      new AMap.TileLayer.Satellite(), // 卫星
      new AMap.TileLayer.RoadNet(), // 路网
    ],
  });
  mapMask(); // 添加地图遮罩层
  //   addMarker(); // 添加地图标注
  addMarker2();
};

// 初始化地图
initMap();

// 关闭按钮
const closePop = (marker) => {
  marker.setLabel({ content: "" });
  map.setZoomAndCenter(10.8, [119.820345878417969, 30.0343912775878906]);
};
