let map;

// 创建icon标注图标
const createIcon = (obj) => {
  const { id, lng, lat, status } = obj;
  const html = `
    <div class="cstm-icon-panel" id="icon-${id}"}>
      <div class="cstm-icon-img">
          <img src=${
            status === 1 ? "./img/dwImg.png" : "./img/errdwlmg.png"
          } style="width: 55px;" />
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

// 三、添加管道流动
const addLinePath = (coordinates) => {
  const jeoJson = {
    type: "FeatureCollection",
    features: coordinates
      .map((coord, index) => ({
        type: "Feature",
        properties: {
          type: index + 1,
          status: coordinates[index + 1] && coordinates[index + 1][2],
        },
        geometry: {
          type: "LineString",
          coordinates:
            coordinates[index + 1] && coordinates[index + 1][2] === 1
              ? [coord, coordinates[index + 1]]
              : [coordinates[index + 1], coord],
        },
      }))
      .filter((o, i) => i + 1 !== coordinates.length),
  };
  const loca = new Loca.Container({ map }); // 在地图创建管道线图层
  // window._loca = loca; // 添加到全局【可不加】
  const geo = new Loca.GeoJSONSource({ data: jeoJson });
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
    trailColor: (_, feature) => "rgba(128, 128, 128, 0.5)",
    interval: 0.5, // 脉冲长度，0.25 表示一段脉冲占整条路的 1/4
    duration: 10000, // 脉冲线的速度，几秒钟跑完整段路
  });

  // 设置数据源
  layer.setSource(geo);
  loca.add(layer);
  loca.animate.start();
};

// 二、获得闸门数据
const initialState = async () => {
  const pathLine = [];
  const { zkStation } = await fetch("./json/高德地图点聚合.json").then((r) =>
    r.json()
  );
  map.getAllOverlays().forEach((item) => {
    if (item.CLASS_NAME === "AMap.Marker") return item.remove();
  });
  if (zkStation && zkStation.length > 0) {
    zkStation.map((item) => {
      item.lng = Number(item.lng);
      item.lat = Number(item.lat);
      pathLine.push([item.lng, item.lat, item.status]);
      const marker = createIcon(item);
      marker.on("click", (e) => {
        const position = e.target.getPosition();
        map.setZoomAndCenter(18, [position.lng, position.lat]);
      });
    });
  }
  addLinePath(pathLine);
};

// 一、初始化地图
const initMap = () => {
  map = new AMap.Map("container", {
    zoom: 14,
    center: [119.905849, 28.465694],
    resizeEnable: true,
    showLabel: true,
    layers: [
      new AMap.TileLayer.Satellite(), // 卫星
      // new AMap.TileLayer.RoadNet(), // 路网
    ],
  });

  // 创建文字标注
  const label = new AMap.Text({
    // 标注文字内容
    text: `
    <p style="display: flex;align-items: center;text-shadow: #fff 1px 0px 1px;color: #000;user-select: none;">
      <img src="./img/start.png" style="width: 15px;margin-right: 5px" />丽水市人民政府
    </p>`,
    position: [119.927049, 28.467165], // 标注位置（经纬度）
    anchor: "center", // 锚点位置
    style: {
      backgroundColor: "#f000",
      borderColor: "#fff0",
      // color: "#46484d",
      fontSize: "15px", // 文字大小
      fontWeight: "bold", // 文字加粗
    },
  });
  // 将文字标注添加到地图
  map.add(label);

  map.on("click", ({ lnglat }) => {
    console.log([lnglat.lng, lnglat.lat]);
  });
  initialState();
};

initMap();
