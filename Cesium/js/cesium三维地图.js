const cesiumDom = document.getElementById("cesiumDom");
let viewer; // cesium3D地图实例

// 初始化地图选项
const option = {
  animation: false, //是否显示动画控件
  homeButton: false, // 是否显示首页按钮
  geocoder: false, // 是否显示输入地名查找控件
  baseLayerPicker: true, // 是否显示选择地形影像等的控件
  timeline: false, // 是否显示时间线控件
  fullscreenButton: false, // 是否全屏显示
  scene3DOnly: true, // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
  infoBox: false, // 是否显示点击要素之后显示的信息
  sceneModePicker: true, // 是否显示投影方式控件（包含二维及三维投影）
  navigationHelpButton: false, // 是否显示帮助控件
  creditDisplay: false, // 是否显示版权信息
  selectionIndicator: false, // 是否显示选取指示器组件
  imageryProvider: false, // 是否显示影像
  orderIndependentTranslucency: false, // 去掉大气层黑圈
  skyAtmosphere: false, // 去掉大气层
  contextOptions: { webgl: { alpha: true } }, // 天空背景为纯色的前提
};

// 初始化Cesium3维地图
const initCesiumMap = async () => {
  // 默认定位到中国，参数依次为东西南北
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    75.0,
    0.0,
    140.0,
    60.0
  );
  viewer = new Cesium.Viewer(cesiumDom, option); // 初始化地图

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      121.10016246000218,
      30.420379951166946,
      50000
    ),
    orientation: {
      pitch: Cesium.Math.toRadians(-60),
    },
  });

  viewer.scene.sun.show = false; // 关闭天空太阳
  viewer.scene.moon.show = false; // 关闭天空月亮
  // viewer.scene.undergroundMode = true; //重要，开启地下模式，设置基色透明，这样就看不见黑色地球了
  // viewer.scene.skyBox.show = false; // 关闭天空盒，否则会显示天空颜色
  // viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0); // 关闭天空后，设置天空颜色
  // viewer.scene.globe.show = false; // 不显示地球
  // viewer.scene.globe.baseColor = new Cesium.Color(0, 0, 0, 0);
  // viewer.scene.imageryLayers.removeAll(); // 去除其他图层

  // 展示指定城市地图
  const data = await fetch("../json/pinghu.json").then((res) => res.json());
  addCityArea(data); // 展示城市范围
};

// 加载指定城市区域
const addCityArea = (geojson) => {
  const arr = [];
  // 解析geojson数据，将边界数据添加到数组
  geojson.features[0].geometry.coordinates[0][0].forEach((item) => {
    arr.push(item[0]), arr.push(item[1]);
  });

  // 创建边界多边形
  const polygonWithHole = new Cesium.PolygonGeometry({
    polygonHierarchy: new Cesium.PolygonHierarchy(
      // Cesium.Cartesian3.fromDegreesArray([
      //   // 两两一队，分别是经纬度，这里现在有四队
      //   73.0, 53.0, 73.0, 0.0, 135.0, 0.0, 135.0, 53.0,
      // ]),
      Cesium.Cartesian3.fromDegreesArray(arr),
      [new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(arr))]
    ),
    heihgt: -5000,
    extrudedHeight: -5000,
  });

  // 将创建的多边形添加到场景中
  const geometry = Cesium.PolygonGeometry.createGeometry(polygonWithHole);

  // 几何体实例在场景中的具体信息
  const instances = [
    new Cesium.GeometryInstance({
      geometry: geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString("#89b4e3")
        ),
      },
    }),
  ];
  // 创建一个Primitive实例
  const primitive = new Cesium.Primitive({
    geometryInstances: instances, // 用于定义要渲染的几何实例列表。
    //  用于为每个几何体实例指定单独的颜色，以便在场景中呈现不同颜色的几何体。
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: false,
    }),
  });
  // 将实例对象展示在场景中
  viewer.scene.primitives.add(primitive);

  console.log("地图条件显示：", primitive); // viewer.scene.globe,
};

initCesiumMap();
