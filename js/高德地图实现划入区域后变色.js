let map;
let satelliteLayer; // 卫星图层变量

const initMap = () => {
  map = new AMap.Map("container", {
    viewMode: "3D",
    zoom: 14,
    center: [119.905849, 28.465694],
    resizeEnable: true,
    showLabel: true,
  });
  // 构造卫星图层
  satelliteLayer = new AMap.TileLayer.Satellite();
  map.add(satelliteLayer); // 添加卫星图层

  // 区域查询
  const opts = {
    subdistrict: 0, //获取边界不需要返回下级行政区
    extensions: "all", //返回行政区边界坐标组等具体信息
    level: "district", //查询行政级别为 市
  };
  const district = new this.AMap.DistrictSearch(opts);
  district.setLevel("district");
  district.search("邯郸市", (status, result) => {});
};

initMap();
