const btn = document.getElementById("btn");
let satelliteLayer; // 卫星底图
let cluster; // 聚合标注对象
let stations; // 水库列表
let sum; // 数据总条数

const initMap = () => {
  map = new AMap.Map("container", {
    center: [119.820345878417969, 30.0343912775878906],
    zooms: [5, 18], // 缩放范围
    animateEnable: true,
  });
  // 构造卫星图层
  satelliteLayer = new AMap.TileLayer.Satellite();
  map.add(satelliteLayer); // 添加卫星图层
};

initMap();

// 聚合后样式
const _renderClusterMarker = (context) => {
  const { marker, count, clusterData } = context;
  const div = document.createElement("div");
  if (count >= 0 && count < 10) {
    div.classList.add("ten");
  } else if (count >= 10 && count < 30) {
    div.classList.add("thirty");
  } else if (count >= 30 && count < 60) {
    div.classList.add("sixty");
  } else if (count >= 60 && count < 100) {
    div.classList.add("oneHundred");
  } else if (count >= 100) {
    div.classList.add("max");
  }

  if (count > 1) {
    // 自定义点击事件
    marker.on("click", () => {
      const markerList = clusterData.map(
        (o) =>
          new AMap.Marker({
            position: o.lnglat,
          })
      );
      map.setFitView(markerList, false);
    });
  }
  const size = Math.round(25 + Math.pow(count / sum, 1 / 5) * 40);
  div.innerHTML = count;
  marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
  marker.setContent(div);
};

// 展开后样式
const _renderMarker = (context) => {
  const content = `
      <div class="cstmIconPanel">
        <div class="cstmIconName">
          <div>
            <img src="./img/dwImg.png" alt="" />
          </div>
          <p>测试水库</p>
        </div>
        <div class="cstmIconImg">
          <img src='./img/dwImg.png' style="width: 60px" />
        </div>
      </div>
    `;
  const offset = new AMap.Pixel(-22, -37);
  context.marker.setContent(content);
  context.marker.setOffset(offset);
};

// 获取水库列表
const getReserList = async () => {
  const res = await fetch("./json/高德地图点聚合 copy.json");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  const jsonData = await res.json();
  stations = jsonData
    .filter((o) => o.coord)
    .map((o) => ({ ...o, lnglat: o.coord.split(",").map(Number) }));
  sum = stations.length;

  // 聚合样式类
  cluster = new AMap.MarkerCluster(map, stations, {
    gridSize: 120, // 聚合网格像素大小
    renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
    renderMarker: _renderMarker, // 自定义非聚合点样式
  });
};

getReserList();

btn.onclick = () => {
  console.log("标注：", cluster);
  cluster.setMap(null); // 将聚合标注从地图上移除
  // 聚合样式类
  cluster = new AMap.MarkerCluster(map, stations, {
    gridSize: 120, // 聚合网格像素大小
    renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
    renderMarker: _renderMarker, // 自定义非聚合点样式
  });
};
