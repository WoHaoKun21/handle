let map;
let satelliteLayer; // 卫星图层变量

// 加载外部乡镇数据
const loadJeoJson = () => {
  fetch("./json/city.json")
    .then((r) => r.json())
    .then((data) => {
      const geoJSON = new AMap.GeoJSON({
        geoJSON: data,
        // 还可以自定义getMarker和getPolyline
        getPolygon: ({ properties: { _parentProperities } }, lnglats) => {
          const text = new AMap.Text({
            text: _parentProperities.name,
            position: _parentProperities.center, // 市区中心坐标
            style: {
              color: "#fff8",
              border: "none",
              padding: "2px 4px",
              "font-size": "12px",
              "background-color": "rgba(255, 255, 255, 0)",
            },
          });
          map.add(text);
          return new AMap.Polygon({
            path: lnglats,
            strokeColor: "#4467a9", // 描边颜色
            strokeWeight: 2, // 描边宽度
            fillColor: "#123083", // 填充颜色
            fillOpacity: 0.8, // 填充透明度
          });
        },
      });
      // 添加 GeoJSON 到地图中
      map.add(geoJSON);
      // 鼠标划入事件监听
      geoJSON.on("mouseover", function (event) {
        event.target.setOptions({
          fillColor: "#3d7bcc", // 鼠标划入后的填充颜色
          fillOpacity: 0.8,
        });
      });
      // 鼠标划出事件监听
      geoJSON.on("mouseout", function (event) {
        event.target.setOptions({
          fillColor: "#123083", // 鼠标划出后恢复原始填充颜色
          fillOpacity: 0.8,
        });
      });
    });
};

// 初始化地图
const initMap = () => {
  const options = {
    subdistrict: 0,
    extensions: "all",
    level: "province",
  };
  const district = new AMap.DistrictSearch(options);
  district.search("平乡县", function (status, result) {
    var bounds = result.districtList[0]["boundaries"];
    var mask = [];
    for (var i = 0; i < bounds.length; i++) {
      mask.push([bounds[i]]);
    }
    //实例化地图
    map = new AMap.Map("container", {
      mask: mask,
      zoom: 11.5, //设置当前显示级别
      center: [115.010951, 37.04589],
      viewMode: "3D",
      pitch: 35, // 倾斜角度
      showLabel: false, // 不显示地图文字标记
      resizeEnable: true,
      layers: [new AMap.TileLayer.RoadNet({}), new AMap.TileLayer.Satellite()],
    });
    // map.setRotation(0); // 旋转角度

    //添加高度面
    let object3Dlayer = new AMap.Object3DLayer({ zIndex: 1 });
    map.add(object3Dlayer);
    // 创建围栏
    let wall = new AMap.Object3D.Wall({
      path: bounds,
      height: -25000,
      color: "#30528640",
    });
    wall.transparent = "both";
    object3Dlayer.add(wall);

    // 添加平乡县的描边
    for (var i = 0; i < bounds.length; i++) {
      new AMap.Polyline({
        path: bounds[i],
        strokeColor: "#dddddd",
        strokeWeight: 10,
        map: map,
      });
    }
    loadJeoJson(); // 加载外部资源数据
    // 创建自定义图层
    const customLayer = new AMap.CustomLayer();

    // 设置自定义图层的参数
    customLayer.render = function (opts, ee) {
      const ctx = opts.ctx;
      // // 设置透明度
      // ctx.globalAlpha = 0; // 设置为完全透明
      // // 绘制需要隐藏的区域
      // // 使用 ctx 对象进行绘制操作，例如绘制多边形、线条等

      // // 例如，绘制一个矩形区域
      // ctx.beginPath();
      // ctx.rect(x, y, width, height);
      // ctx.closePath();
      // ctx.stroke();
    };
    // 将自定义图层添加到地图上
    map.add(customLayer);

    // 地图点击事件
    map.on("click", (e) => {
      console.log([e.lnglat.lng, e.lnglat.lat]);
    });
  });
};

initMap();
