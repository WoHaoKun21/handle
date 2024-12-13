// Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NTQ1NzViMS01ZDE0LTQzZDQtOGJkYi0xNjE0OThkNjNlM2IiLCJpZCI6MTczMzMwLCJpYXQiOjE3MzMzMDI2NDl9.u5aqxhYFmwy_ntbdrY0f7Q172iKOwY0t3-av-FZNlbM';
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

// 裁剪城市
const clippingCity = (geojson) => {
  // 1、创建边界数据存储变量
  const arr = [];
  // 2、解析geojson数据，将边界数据添加到数组
  geojson.features[0].geometry.coordinates[0][0].forEach((item) => {
    arr.push(item[0]), arr.push(item[1]);
  });
  // 3、将地理坐标（经度和纬度）转换为三维空间中的笛卡尔坐标
  const positions = Cesium.Cartesian3.fromDegreesArray(arr);
  // 4、对地图进行裁剪，只会展示裁剪后的区域
  const clippingPolygons = new Cesium.ClippingPolygonCollection({
    polygons: [new Cesium.ClippingPolygon({ positions, heihgt: 500 })],
  });
  // 5、是否反选裁剪多边形
  clippingPolygons.inverse = true;
  // 6、获取当前的裁剪多边形集合并展示在地图上
  viewer.scene.globe.clippingPolygons = clippingPolygons;
};

const addCityAreaHeight = (geojson, heihgt) => {
  // 1、创建边界数据存储变量
  const arr = [];
  // 2、解析geojson数据，将边界数据添加到数组
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
    heihgt,
    extrudedHeight: heihgt,
  });

  // 将创建的多边形添加到场景中
  const geometry = Cesium.PolygonGeometry.createGeometry(polygonWithHole);

  // 几何体实例在场景中的具体信息
  const instances = [
    new Cesium.GeometryInstance({
      geometry: geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString("rgba(255,255,0,0.3)")
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

  // 加载地图边界数据
  const geojson = await fetch("./json/pinghu.json").then((res) => res.json());
  clippingCity(geojson);
  // 为裁剪区域填充高度
  addCityAreaHeight(geojson, -1600);
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(
      121.08907438222772,
      30.702987136907296
    ),
    billboard: {
      image: "./img/dwImg.png",
      scale: 1,
      color: Cesium.Color.YELLOW,
    },
  });
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(
      121.08907438222772,
      30.702987136907296
    ),
    label: {
      text: "Cesium",
      pixelOffset: new Cesium.Cartesian2(0, -50),
      fillColor: Cesium.Color.YELLOWGREEN, // 颜色变量
      showBackground: true,
      backgroundColor: new Cesium.Color(255, 255, 0), // new 因为后面是个类 要实例化
    },
  });

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
