let map;

const count = waterArr.length;

const _renderClusterMarker = function (context) {
  let bgColor = ""; // 聚合点颜色
  // 聚合中点个数
  const clusterCount = context.count;
  const div = document.createElement("div");
  // 聚合点配色
  const defaultColor = [
    "204,235,197",
    "168,221,181",
    "123,204,196",
    "78,179,211",
    "43,140,190",
  ];
  if (clusterCount >= 0 && clusterCount < 10) {
    bgColor = defaultColor[0];
  } else if (clusterCount >= 10 && clusterCount < 100) {
    bgColor = defaultColor[1];
  } else if (clusterCount >= 100 && clusterCount < 1000) {
    bgColor = defaultColor[2];
  } else if (clusterCount >= 1000 && clusterCount < 10000) {
    bgColor = defaultColor[3];
  } else if (clusterCount >= 10000) {
    bgColor = defaultColor[4];
  }
  div.style.backgroundColor = "rgba(" + bgColor + ",.5)";
  const size = Math.round(25 + Math.pow(clusterCount / count, 1 / 5) * 40);
  div.style.width = div.style.height = size + "px";
  div.style.border = "solid 1px rgba(" + bgColor + ",1)";
  div.style.borderRadius = size / 2 + "px";
  div.innerHTML = context.count;
  div.style.lineHeight = size + "px";
  div.style.color = "#ffffff";
  div.style.fontSize = "12px";
  div.style.textAlign = "center";
  context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
  context.marker.setContent(div);
};
const _renderMarker = function (context) {
  const { id, coord, status, name } = context.data[0];
  const [lng, lat] = coord.split(",").map(Number);
  const html = `<div class="cstm-icon-panel" id="icon-${id}">
      <div class="cstm-icon-name">${name}</div>
      <div class="cstm-icon-img">
        <img src=${
          status === 0 ? "/img/dwImg.png" : "/img/errdwlmg.png"
        } style="width: 40px" />
      </div>
  </div>`;
  context.marker.setContent(html);
  context.marker.on("click", () =>
    flayPopHtml(context.marker, context.data[0])
  );
};

// 弹框生成
const flayPopHtml = (marker, item) => {
  map.getAllOverlays().map((o) => {
    if (o.type === "AMap.Marker") o.setLabel({ content: "" });
  });
  marker.dom.classList.add("active");
  map.setFitView([marker], false, [0, 0, 0, 0], 14);
  marker.setLabel({
    direction: "top",
    offset: new AMap.Pixel(0, -20),
    content: `<div class="pop_zm" id="pop-${item.id}">loading......</div>`,
  });
};

// 初始化地图
const initMap = (list) => {
  map = new AMap.Map("container", {
    zoom: 10.8,
    zooms: [5, 18], // 缩放范围
    resizeEnable: true,
    showLabel: false, // 不显示地图文字标记
    center: [119.820345878417969, 30.0343912775878906],
  });
  // 构造卫星图层
  satelliteLayer = new AMap.TileLayer.Satellite();
  map.add(satelliteLayer); // 添加卫星图层
  list = list.map((item) => {
    const [lng, lat] = item.coord.split(",").map(Number);
    return {
      ...item,
      lnglat: [lng, lat],
    };
  });
  // 标注聚合
  const cluster = new AMap.MarkerCluster(map, list, {
    gridSize: 60, // 聚合网格像素大小
    renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
    renderMarker: _renderMarker, // 自定义非聚合点样式
  });
  // 地图点击事件
  map.on("click", function (e) {
    console.log([e.lnglat.lng, e.lnglat.lat]);
  });
};

// 地图加载
initMap(waterArr);
