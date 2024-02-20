//   <div id="bai-du-map" class="full"></div>

const name = "m-map";
const props = {
  name: {
    type: String,
    default: "",
  },
};

const watch = {
  name() {
    this.drawBounds();
  },
};
const methods = {
  async initMap() {
    let AMap = await AMapLoader.load({
      key: "--Web端Key--",
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.DistrictSearch"], // 这里需要使用的的插件列表，如比例尺'AMap.Scale'等
    });
    this.AMap = AMap;
    // 初始化地图
    this.map = new AMap.Map("bai-du-map", {
      viewMode: "2D", //  是否为3D地图模式
      zoom: 13, // 初始化地图级别
      center: [116.397428, 39.90923], //中心点坐标
      resizeEnable: true,
    });
  },
  drawBounds: function () {
    //加载行政区划插件
    if (!this.district) {
      //实例化DistrictSearch
      var opts = {
        subdistrict: 0, //获取边界不需要返回下级行政区
        extensions: "all", //返回行政区边界坐标组等具体信息
        level: "district", //查询行政级别为 市
      };
      this.district = new this.AMap.DistrictSearch(opts);
    }
    //行政区查询
    this.district.setLevel("district");
    this.district.search(this.$props.name, (status, result) => {
      if (this.polygon) {
        this.map.remove(this.polygon); //清除上次结果
        this.polygon = null;
      }
      var bounds = result.districtList[0].boundaries;
      if (bounds) {
        //生成行政区划polygon
        for (var i = 0; i < bounds.length; i += 1) {
          //构造MultiPolygon的path
          bounds[i] = [bounds[i]];
        }
        this.polygon = new this.AMap.Polygon({
          strokeWeight: 1,
          path: bounds,
          fillOpacity: 0.4,
          fillColor: "#80d8ff",
          strokeColor: "#0091ea",
        });
        //区域内悬浮
        this.polygon.on("mouseover", () => {
          this.polygon.setOptions({
            fillOpacity: 0.7,
            fillColor: "#7bccc4",
          });
        });
        //离开区域
        this.polygon.on("mouseout", () => {
          this.polygon.setOptions({
            fillOpacity: 0.5,
            fillColor: "#ccebc5",
          });
        });

        this.map.add(this.polygon);
        this.map.setFitView(this.polygon); //视口自适应
      }
    });
  },
};
