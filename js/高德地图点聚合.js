let map;
let infoWindow;

const count = waterArr.length;

// 聚合后样式
const _renderClusterMarker = (context) => {
  let bgColor = ""; // 聚合点颜色
  // 聚合中点个数
  const clusterCount = context.count;
  const div = document.createElement("div");
  // 聚合点配色
  const defaultColor = [
    "110, 204, 57",
    "240, 194, 12",
    "241, 128, 23",
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
  div.style.userSelect = "none";
  context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
  context.marker.setContent(div);
  context.marker.on("click", () => {
    const markers = context.clusterData.map(
      (o) => new AMap.Marker({ position: o.coord.split(",") })
    );
    map.setFitView(markers, false, [0, 0, 0, 0]);
  });
};

// 非聚合站点样式
const _renderMarker = (context) => {
  const { id, coord, status, name } = context.data[0];
  const [lng, lat] = coord.split(",").map(Number);
  const html = `
  <div class="cstm-icon-panel" id="icon-${id}">
    <div class="cstm-icon-name">${name}</div>
    <div class="cstm-icon-img">
      <img src=${
        status === 0 ? "/img/dwImg.png" : "/img/errdwlmg.png"
      } style="width: 40px" />
    </div>
  </div>`;

  context.marker.setContent(html);
  context.marker.on("click", () => {
    flayPopHtml(context.marker, context.data[0]);
  });
};

// 弹框生成
const flayPopHtml = (marker, item) => {
  map.setFitView(marker, false, [680, 0, 0, -380], 14);
  setTimeout(() => {
    infoWindow.open(map, item.coord.split(",").map(Number));
  }, 300);
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

  // 生成聚合坐标
  list = list.map((item) => {
    const [lng, lat] = item.coord.split(",").map(Number);
    return {
      ...item,
      lnglat: [lng, lat],
    };
  });

  // 生成信息框
  infoWindow = new AMap.InfoWindow({
    isCustom: true,
    offset: [15, -50],
    content: `<div class="pop_zm" id="pop_box">loading......</div>`, //使用默认信息窗体框样式，显示信息内容
  });

  // 标注聚合
  new AMap.MarkerCluster(map, list, {
    gridSize: 60, // 聚合网格像素大小
    renderClusterMarker: _renderClusterMarker, // 自定义聚合后的样式
    renderMarker: _renderMarker, // 自定义非聚合站点样式
  });

  // 地图点击事件
  map.on("click", function (e) {
    console.log([e.lnglat.lng, e.lnglat.lat]);
    infoWindow.remove();
  });
};

// 地图加载
initMap(waterArr);
