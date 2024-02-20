import { MeshLineGeometry, MeshLineMaterial } from "../plugins/meshline.js";

class FlowlineLayer extends Layer {
  // 图层数据
  _data = [];
  // 线材质
  _material = null;

  /**
   *  @param {Object}   config
   *  @param {geoJSON}  config.data 路径数据
   *  @param {Number}   [config.lineWidth=20.0] 路径线条宽度
   *  @param {Number}   [config.altitude=0.0] 整体海拔高度
   *  @param {Array}    [config.zooms=[5,14]] 显示区间
   *  @param {Boolean}  [config.animate=true] 是否显示动画
   *  @param {Number}   [config.speed=1.0]  流动速度系数
   *  @param {String}   [config.uvMapURL='./static/texture/road_bg1.png'] 线条纹理URL
   */
  constructor(config) {
    const conf = {
      data: null,
      speed: 1,
      animate: true,
      lineWidth: 20.0,
      altitude: 0.0,
      uvMapURL: "./static/texture/road_bg1.png",
      ...config,
    };

    super(conf);
    this.initData(conf.data);
  }
  initData(data) {
    const arr = data?.features.map((item) => {
      return item?.geometry?.coordinates[0];
    });
    // 经纬度转为空间坐标
    const res = this.customCoords.lngLatsToCoords(arr);
    this._data = res;
  }

  initLines() {
    const { scene } = this;

    //材质纹理
    const texture = new THREE.TextureLoader().load(
      this.mergeSourceURL(this._conf.uvMapURL)
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const material = new MeshLineMaterial({
      lineWidth: this._conf.lineWidth,
      sizeAttenuation: 1,
      useMap: 1,
      opacity: 1,
      map: texture,
      transparent: true,
      depthTest: true,
    });
    this._material = material;

    //生成网格体
    const multiLine = [...this._data];
    multiLine.forEach((lineData) => {
      const points = [];
      lineData.forEach(([x, y]) => {
        points.push(new THREE.Vector3(x, y, this._conf.altitude));
      });

      const line = new MeshLineGeometry();
      line.setPoints(points);
      const mesh = new THREE.Mesh(line, material);

      scene.add(mesh);
    });
  }

  // 更新纹理偏移量
  update() {
    if (!this._isAnimate) {
      return;
    }
    if (this._material?.uniforms?.offset) {
      this._material.uniforms.offset.value.x -= 0.01 * this._conf.speed;
    }
  }
}
