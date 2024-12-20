// Cesium.Ion.defaultAccessToken =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NTQ1NzViMS01ZDE0LTQzZDQtOGJkYi0xNjE0OThkNjNlM2IiLCJpZCI6MTczMzMwLCJpYXQiOjE3MzMzMDI2NDl9.u5aqxhYFmwy_ntbdrY0f7Q172iKOwY0t3-av-FZNlbM";
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
//   terrainProvider: Cesium.createWorldTerrain(),
};
// 初始化Cesium3维地图——测试版
const initCesiumMap = async () => {
  // 默认定位到中国，参数依次为东西南北
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    75.0,
    0.0,
    140.0,
    60.0
  );
  viewer = new Cesium.Viewer(cesiumDom, option); // 初始化地图
  viewer.terrainProvider = await Cesium.createWorldTerrainAsync({
    requestWaterMask: true,
  });
  // 跳转视角到指定城市
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
};

// 初始化三维地图
initCesiumMap();
