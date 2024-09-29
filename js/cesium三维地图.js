const cesiumDom = document.getElementById("cesiumDom");
let viewer; // cesium3D地图实例
let entities = [];
// 初始化地图选项
let option = {
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
  selectionIndicator: false,// 是否显示选取指示器组件
  imageryProvider: false,// 是否显示影像
};

// 添加城市区域划分
const addCityArea = async () => {};

// 初始化Cesium3维地图
const initCesiumMap = () => {
  viewer = new Cesium.Viewer(cesiumDom, option);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      121.20416246000218,
      30.500379951166946,
      50000
    ),
    orientation: {
      pitch: Cesium.Math.toRadians(-60),
    },
  });

  // 添加区域划分
  addCityArea();

  // 地图点击事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event) => {
    let mapPosition = {};
    const pick1 = viewer.scene.pickPosition(event.position);
    const pick2 = viewer.scene.camera.pickEllipsoid(event.position);
    const ray = viewer.camera.getPickRay(event.position);
    const pick3 = viewer.scene.globe.pick(ray, viewer.scene);
    // 是否都获得了有效值
    if (
      Cesium.defined(pick1) &&
      Cesium.defined(pick2) &&
      Cesium.defined(pick3)
    ) {
      const pickArray = [pick1, pick2, pick3];
      pickArray.forEach((item) => {
        // 笛卡尔坐标系转为经纬度（弧度）坐标
        const cartographic = Cesium.Cartographic.fromCartesian(item);
        // 再将经纬度（弧度）坐标转化为经纬度角度坐标
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        mapPosition = {
          x: lng,
          y: lat,
          z: cartographic.height,
        };
        console.log("鼠标点击的点坐标：", mapPosition);
      });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

// 初始化三维地图
initCesiumMap();
