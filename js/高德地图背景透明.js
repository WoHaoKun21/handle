initMap = () => {
  const { businessMapProjectDTOS, provinceLocationAndProjectNumbers } =
    this.state.mapData;
  // 定义行政区域
  let disCountry = new AMap.DistrictLayer.Country({
    zIndex: 10,
    SOC: "CHN",
    depth: 1,
    styles: {
      "nation-stroke": "#00F6FF",
      "coastline-stroke": "#00F6FF",
      "province-stroke": "#00F6FF",
      fill: (props) => {
        return this.getColorByDGP(props.adcode_pro);
      },
    },
  });

  // 定义地图，使用自定义样式
  this.map = new AMap.Map("container", {
    mapStyle: "amap://styles/a2ebd486f0f7ff0e51174dc437bee53c", // 自定义地图样式
    resizeEnable: true, //是否监控地图容器尺寸变化
    layers: [disCountry], //地图图层数组
    zooms: [3, 10], // 缩放级别范围
    center: [106.122082, 33.719192],
    zoom: 4.5,
    isHotspot: false, // 是否开启地图热点和标注的hover效果
    defaultCursor: "pointer", // 默认鼠标样式
    viewMode: "2D", // 默认为2D，可选3D
  });

  this.map.on("complete", () => {
    var layer = new AMap.LabelsLayer({
      collision: false, // 开启标注避让，默认为开启，v1.4.15 新增属性
      animation: true, // 开启标注淡入动画，默认为开启，v1.4.15 新增属性
      zIndex: 51,
    });
    // 行政区名字labelsMarker
    for (let i = 0; i < LabelsData.length; i++) {
      var labelsMarker = new AMap.LabelMarker(LabelsData[i]);
      layer.add(labelsMarker);
    }
    this.map.add(layer);

    // 打图标和文字
    for (let i = 0; i < businessMapProjectDTOS.length; i++) {
      this.iconMarks[i] = new AMap.Marker({
        position: [
          businessMapProjectDTOS[i].longitude,
          businessMapProjectDTOS[i].latitude,
        ],
        anchor: "center", //设置锚点
        offset: new AMap.Pixel(0, 0), //设置偏移量
        zIndex: 3,
        content: `<img class="marker-icon" src=${importantIcon}>`,
      });
      this.nameMarkers[i] = new AMap.Marker({
        position: [
          businessMapProjectDTOS[i].longitude,
          businessMapProjectDTOS[i].latitude,
        ],
        anchor: "center", //设置锚点
        offset: new AMap.Pixel(-10, -55), //设置偏移量
        zIndex: 4,
        content: `
          <div class="marker-label">
            <span>${businessMapProjectDTOS[i].projectAbbreviation}</span>
          </div>`,
        map: this.map,
      });

      // 给文字标添加点击事件
      AMap.event.addListener(this.nameMarkers[i], "click", (e) => {
        this.setState({
          detailObj: businessMapProjectDTOS[i],
        });
      });
      AMap.event.addListener(this.iconMarks[i], "click", (e) => {
        this.setState({
          detailObj: businessMapProjectDTOS[i],
        });
      });
    }
    this.map.add(this.iconMarks);
    this.map.add(this.nameMarkers);
  });
};

getColorByDGP = (adcode) => {
  let colors = [];
  if (!colors[adcode]) {
    if (
      adcode === 110000 ||
      adcode === 120000 ||
      adcode === 130000 ||
      adcode === 310000 ||
      adcode === 320000 ||
      adcode === 330000 ||
      adcode === 340000 ||
      adcode === 440000 ||
      adcode === 500000 ||
      adcode === 510000
    ) {
      colors[adcode] = "rgba(199,246,177,.8)";
    } else {
      colors[adcode] = "rgba(3, 140, 230, 0.7)";
    }
  }
  return colors[adcode];
};

initMap();
