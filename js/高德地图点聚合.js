const map = new AMap.Map("container", {
  center: [104.937478, 35.439575],
  mapStyle: "amap://styles/grey",
  zoom: 5,
});
const count = points.length;
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
  const content =
    '<div style="background-color: rgba(255,255,178,.9); height: 18px; width: 18px; border: 1px solid rgba(255,255,178,1); border-radius: 12px; box-shadow: rgba(0, 0, 0, 1) 0px 0px 3px;"></div>';
  const offset = new AMap.Pixel(-9, -9);
  context.marker.setContent(content);
  context.marker.setOffset(offset);
};
const cluster = new AMap.MarkerCluster(map, points, {
  gridSize: 60, // 聚合网格像素大小
  renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
  renderMarker: _renderMarker, // 自定义非聚合点样式
});
