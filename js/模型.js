const {
  Engine3D, // Engine3D 类为引擎主体，包含引擎初始化启动、运行渲染等核心方法
  Scene3D, // 通过新建 Scene3D 类可以创建一个场景实例，该场景实例在程序中通常作为根节点被使用
  Object3D, // Object3D 类定义了物体对象，该对象包含常用的物体属性如位置、旋转等参数
  Camera3D, // 通过新建 Camera3D 类可以创建一个摄像机3D组件的实例，该实例可以作为相机节点添加到场景中
  View3D, // View3D，指定引擎渲染的目标场景和观察相机
  LitMaterial, // 通过 LitMaterial 类可以创建材质实例，并通过设置材质参数实现不同的材质效果
  BoxGeometry, // 通过 BoxGeometry 类可以创建一个长方体几何体
  MeshRenderer, // MeshRenderer组件，为物体提供 mesh 对象几何渲染
  DirectLight, // 平行光组件，可以设置平行光组件的颜色、强度属性和光照角度来获得合适的光照效果
  HoverCameraController, // 盘旋相机组件，可以控制相机围绕观察点移动
  AtmosphericComponent, // 引擎内置的大气天空盒组件
} = Orillusion;

// 初始化模型
const initialOrillusion = async () => {
  const canvas = document.getElementById("canvas");
  // console.log(Engine3D);

  // 初始化引擎
  await Engine3D.init({
    canvasConfig: { canvas },
  });
  const scene3D = new Scene3D(); // 创建一个3D场景
  const sky = scene3D.addComponent(AtmosphericComponent); // 添加大气散射天空组件
  // 新建摄像机实例
  const cameraObj = new Object3D();
  const camera = cameraObj.addComponent(Camera3D);
  // 根据窗口大小设置摄像机视角
  camera.perspective(60, window.innerWidth / window.innerHeight, 1, 5000.0);
  // 设置相机控制器
  const controller = camera.object3D.addComponent(HoverCameraController);
  controller.setCamera(0, 0, 15);
  // 添加相机节点
  scene3D.addChild(cameraObj);
  // 新建光照
  const light = new Object3D();
  // 添加直接光组件
  const component = light.addComponent(DirectLight);
  // 调整光照参数
  light.rotationX = 45;
  light.rotationY = 30;
  component.intensity = 2;
  // 添加光照对象
  scene3D.addChild(light);
  // 新建对象
  const obj = new Object3D();
  // 为对象添 MeshRenderer
  const mr = obj.addComponent(MeshRenderer);
  // 设置几何体
  mr.geometry = new BoxGeometry(5, 5, 5);
  // 设置材质
  mr.material = new LitMaterial();
  scene3D.addChild(obj);
  // 创建View3D对象
  const view = new View3D();
  // 指定渲染的场景
  view.scene = scene3D;
  // 指定使用的相机
  view.camera = camera;
  // 开始渲染
  Engine3D.startRenderView(view);
};

initialOrillusion();
