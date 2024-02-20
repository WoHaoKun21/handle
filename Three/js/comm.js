let scene, // 虚拟场景
  mesh, // 网格模式
  camera, // 相机存储对象
  renderer; //渲染器对象
const width = 900,
  height = 600;

// 初始化虚拟场景
function initScene() {
  // 一、创建3D虚拟场景
  scene = new THREE.Scene();
  // 二、创建集合体
  const geometry = new THREE.BoxGeometry(30, 60, 30); // 创建圆锥体，参数表示物体的
  // 三、创建几何体外观
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  // 四、创建网格模式
  mesh = new THREE.Mesh(geometry, material);
  // 五、设置模型位置
  mesh.position.set(0, 0, 0);
  // 六、添加模型到场景中
  scene.add(mesh);
}

// 为虚拟场景添加光源
function initLight(flag) {
  if (flag) {
    //  一、点光源辅助器+环境光源；
    const ambient = new THREE.AmbientLight(0xffffff, 0.9); // 创建点光源
    ambient.position.set(-100, 50, 60); // 设置光源位置
    scene.add(ambient); // 将光源添加到物理空间中
    // 光源辅助观察——为虚拟空间添加一个光源来源模型
    const pointLightHelper = new THREE.PointLightHelper(ambient, 10);
    scene.add(pointLightHelper);
  } else {
    // 平行光辅助器+平行光
    const directional = new THREE.DirectionalLight(0xffffff, 1); // 创建平行光
    // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
    directional.position.set(-100, 50, 60); // 设置平行光来源位置
    // 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
    scene.add(directional); // 为场景添加光源
    const dirLightHelper = new THREE.DirectionalLightHelper( // 添加平行光源模型
      directional,
      5,
      0xffffff
    );
    scene.add(dirLightHelper);
  }
}

// 相机创建
function initCamera() {
  // 一、构建相机
  camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000); // 创建相机，并设置相机的角度、canvas宽高比、近截面、远截面
  // 二、设置相机位置
  camera.position.set(200, 200, 200); // 设置相机的初始视角
  // 三、设置相机观察模型位置
  camera.lookAt(mesh.position);
}

// 渲染器——接受的是一个DOM挂载点
function initRenderer(DOM) {
  // 一、创建渲染器
  renderer = new THREE.WebGLRenderer(); // 创建渲染器对象
  // 二、设置渲染器对象画布大小
  renderer.setSize(width, height);
  // 三、通过渲染器方法，将相机和场景进行渲染
  renderer.render(scene, camera);
  // 四、将徐娜然完成的canvas画布怪再到指定DOM对象里面
  DOM.appendChild(renderer.domElement);
}

// 相机控件：实现模型旋转、缩放、平移效果。
function initOrbitControls() {
  // 一、对相机添加控件
  const controls = new OrbitControls(camera, renderer.domElement); // 设置相机控件轨道控制器OrbitControls
  // 二、设置监听事件，如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
  controls.addEventListener("change", function (e) {
    renderer.render(scene, camera); //执行渲染操作
  }); //监听鼠标、键盘事件
}
