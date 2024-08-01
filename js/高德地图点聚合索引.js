map = new AMap.Map("container", {
  center: [116.397428, 39.90923],
  zoom: 9,
  animateEnable: true,
  mapStyle: "amap://styles/grey",
});
const count = points.length;
const clusterMarkers = () => {
  const markerList = [];
  const marker = new AMap.Marker({
    map: map,
  });
  markerList.push(marker);
  return markerList;
};
const clusterIndexSet = {
  city: {
    minZoom: 2,
    maxZoom: 10,
  },
  district: {
    minZoom: 10,
    maxZoom: 12,
  },
  area: {
    minZoom: 12,
    maxZoom: 15,
  },
  community: {
    minZoom: 15,
    maxZoom: 22,
  },
};
const getStyle = (context) => {
  const clusterData = context.clusterData; // 聚合中包含数据
  const index = context.index; // 聚合的条件
  const count = context.count; // 聚合中点的总数
  const marker = context.marker; // 聚合绘制点 Marker 对象
  const color = ["8,60,156", "66,130,198", "107,174,214", "78,200,211"];
  const indexs = ["city", "district", "area", "community"];
  const i = indexs.indexOf(index["mainKey"]);
  const text = clusterData[0][index["mainKey"]];
  const size = Math.round(30 + Math.pow(count / points.length, 1 / 5) * 70);
  if (i <= 2) {
    const extra = '<span class="showCount">' + context.count + "套</span>";
    // text = `<span class="showName">${text}</span>`;
    // text += extra;
  } else {
    size = 12 * text.length + 20;
  }
  const style = {
    bgColor: "rgba(" + color[i] + ",.8)",
    borderColor: "rgba(" + color[i] + ",1)",
    text: text,
    size: size,
    index: i,
    color: "#ffffff",
    textAlign: "center",
    boxShadow: "0px 0px 5px rgba(0,0,0,0.8)",
  };
  return style;
};
const getPosition = (context) => {
  const key = context.index.mainKey;
  const dataItem = context.clusterData && context.clusterData[0];
  const districtName = dataItem[key];
  if (!district[districtName]) {
    return null;
  }
  const center = district[districtName].center.split(",");
  const centerLnglat = new AMap.LngLat(center[0], center[1]);
  return centerLnglat;
};
const _customRender = (data) => {
  const keys = Object.keys(data.clusterData);
  let markers = [];
  for (const i = 0; i < keys.length; i++) {
    const key = keys[i];
    const cluster = data.clusterData[key];
    const position = cluster.data[0].lnglat;
    const marker = new AMap.LabelMarker({
      position: position,
      text: {
        content: cluster.data.length.toString(),
        style: {
          fillColor: "#ffffff",
        },
      },
    });
    markers.push(marker);
  }
  return {
    type: "type",
    layer: null,
    markers: markers,
  };
};
// 自定义聚合点样式
const _renderClusterMarker = (context) => {
  const clusterData = context.clusterData; // 聚合中包含数据
  const index = context.index; // 聚合的条件
  const count = context.count; // 聚合中点的总数
  const marker = context.marker; // 聚合点标记对象
  const styleObj = getStyle(context);
  // 自定义点标记样式
  const div = document.createElement("div");
  div.className = "amap-cluster";
  div.style.backgroundColor = styleObj.bgColor;
  div.style.width = styleObj.size + "px";
  if (styleObj.index <= 2) {
    div.style.height = styleObj.size + "px";
    // 自定义点击事件
    context.marker.on("click", (e) => {
      console.log(e);
      const curZoom = map.getZoom();
      if (curZoom < 20) {
        curZoom += 1;
      }
      map.setZoomAndCenter(curZoom, e.lnglat);
    });
  }
  div.style.border = "solid 1px " + styleObj.borderColor;
  div.style.borderRadius = styleObj.size + "px";
  div.innerHTML = styleObj.text;
  div.style.color = styleObj.color;
  div.style.textAlign = styleObj.textAlign;
  div.style.boxShadow = styleObj.boxShadow;
  context.marker.setContent(div);
  // 自定义聚合点标记显示位置
  const position = getPosition(context);
  if (position) {
    context.marker.setPosition(position);
  }
  context.marker.setAnchor("center");
};

const cluster = new AMap.IndexCluster(map, points, {
  renderClusterMarker: _renderClusterMarker,
  clusterIndexSet: clusterIndexSet,
});
