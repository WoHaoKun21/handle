class HighlightEntity {
  _viewer = null;
  _dataSource = null;
  _highlightEntity = null;
  _xzqList = {};
  _province = null;
  _city = null;
  _county = null;
  _provinceXY = [];
  _cityXY = [];
  _countyXY = [];
  _codes = {
    pCode: null,
    cCode: null,
    code: null,
  };
  _highlightData = {
    province: [],
    city: [],
    county: [],
  };
  pickedId = "";
  alpha = 1;
  _type = "province";
  _historyMaterial = null;
  _entities = [];
  _bg_entity = null;
  UpFun = () => {};
  DownFun = () => {};
  ChangeFun = () => {};
  constructor(_viewer) {
    this._viewer = _viewer;
    this._viewer.scene.globe.depthTestAgainstTerrain = false;
  }
  destroy() {
    this._viewer.scene.globe.depthTestAgainstTerrain = true;
    this.clearDataSources();
    // 移除父级区域
    this.removeEntity();
  }
  // 清除数据
  clearDataSources() {
    if (this._dataSource) {
      this._viewer.dataSources.remove(this._dataSource);
      this._dataSource = null;
    }
  }
  removeEntity() {
    if (this._entities.length > 0) {
      this._entities.forEach((entity) => {
        this._viewer.entities.remove(entity);
      });
      this._entities = [];
    }
  }
  addEventListenerUp(callback) {
    callback && (this.UpFun = callback);
  }
  addEventListenerDown(callback) {
    callback && (this.DownFun = callback);
  }
  addEventListenerChange(callback) {
    callback && (this.ChangeFun = callback);
  }
  async loadDataSource(type, { pCode, cCode, code }) {
    this._type = type;
    if (type == "province") {
      await this.getProvince(pCode);
      this.provinceDataSource(JSON.parse(JSON.stringify(this._province)));
    } else if (type == "city") {
      await this.getCity(pCode, cCode);
      this.cityDataSource(JSON.parse(JSON.stringify(this._city)));
    } else if (type == "county") {
      await this.getCounty(pCode, cCode, code);
      this.countyDataSource(JSON.parse(JSON.stringify(this._county)));
    }
  }
  setCenter(item) {
    return {
      name: item.properties.name,
      center: item.properties.centroid || item.properties.center,
      code: item.properties.adcode,
    };
  }
  // 获取省下面市级
  async getProvince(code) {
    this._codes.pCode = code;
  }
  // 获取市下面县级
  async getCity(dCode, code) {
    this._codes.pCode = dCode;
    this._codes.cCode = code;
  }
  // 获取县下面区级
  async getCounty(dCode, cCode, code) {
    this._codes.pCode = dCode;
    this._codes.cCode = cCode;
    this._codes.code = code;
  }
  setHighlightData(data) {
    if (!data) {
      return;
    }
    this._highlightData = {};
    data.forEach((item) => {
      if (!this._highlightData[item.type]) {
        this._highlightData[item.type] = [];
      }
      this._highlightData[item.type].push({
        code: item.code,
        color: item.color,
      });
    });
  }
  setEntityHighlight(dataSource, type) {
    let height = 20000;
    // 设置行政区域的样式
    const entities = dataSource.entities.values;
    let _hData = this._highlightData[type];
    let d = null;
    // 拉伸面为立体
    entities?.forEach((entity) => {
      if (entity.show) {
        let lastHeight = height;
        if (type == "province") {
          lastHeight = height;
        } else if (type == "city") {
          lastHeight = height - 8000;
        } else if (type == "county") {
          lastHeight = height - 12000;
        }
        entity.polygon.fill = true;
        entity.polygon.extrudedHeight = lastHeight;
        d = null;
        _hData &&
          (d = _hData.find(
            (item) => item.code == entity.properties.adcode._value
          ));
        if (d && d.color) {
          entity.polygon.material = Cesium.Color.fromCssColorString(
            d.color
          ).withAlpha(this.alpha);
          entity.polygon.outlineColor = Cesium.Color.fromCssColorString(
            d.color
          );
          entity.polygon.outline = true;
        }
      }
    });
    let lastHeight = 0;
    if (type == "province") {
      lastHeight = height + 9000;
      this._provinceXY.forEach((item) => {
        this.drawTextEntity(item, lastHeight);
      });
    } else if (type == "city") {
      lastHeight = height + 1000;
      this._cityXY.forEach((item) => {
        this.drawTextEntity(item, lastHeight);
      });
    } else if (type == "county") {
      lastHeight = height;
      this._countyXY.forEach((item) => {
        this.drawTextEntity(item, lastHeight);
      });
    }
  }
  drawTextEntity(data, height) {
    let option = {
      position: Cesium.Cartesian3.fromDegrees(
        Number(data.center[0]),
        Number(data.center[1]),
        height
      ),
      label: {
        //标签
        scale: 0.8,
        font: "13px 微软雅黑",
        text: data.name || "",
        pixelOffset: new Cesium.Cartesian2(26, 0),
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          1000000000000
        ),
        scaleByDistance: new Cesium.NearFarScalar(
          200000,
          1.2,
          100000000000,
          0.5
        ),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // heightReference: Cesium.HeightReference.NONE
      },
      billboard: {
        image: sheng_icon,
        width: 12,
        height: 12,
        disableDepthTestDistance: 350000,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          1000000000000
        ),
        scaleByDistance: new Cesium.NearFarScalar(
          200000,
          1.2,
          100000000000,
          0.5
        ),
      },
    };
    let entity = this._viewer.entities.add(option);
    this._entities.push(entity);
  }
  // 下钻
  async leftClickEntityDown(movement, type) {
    const pickedObject = this._viewer.scene.pick(movement.position);
    if (
      Cesium.defined(pickedObject) &&
      pickedObject.id instanceof Cesium.Entity
    ) {
      if (pickedObject.id.properties && pickedObject.id.properties.adcode) {
        if (type == "province") {
          // 移除父级区域
          this.removeEntity();
          this._codes.cCode = pickedObject.id.properties.adcode._value;
          this.getCity(this._codes.pCode, this._codes.cCode);
          await this.ChangeFun(this._codes.cCode, "city");
          this.cityDataSource(JSON.parse(JSON.stringify(this._city)));
          this.DownFun(this._codes.cCode, "city");
        } else if (type == "city") {
          if (this._type == "city") {
            return;
          }
          // 移除父级区域
          this.removeEntity();
          this._codes.code = pickedObject.id.properties.adcode._value;
          this.getCounty(
            this._codes.pCode,
            this._codes.cCode,
            this._codes.code
          );
          await this.ChangeFun(this._codes.code, "county");
          this.countyDataSource(JSON.parse(JSON.stringify(this._county)));
          this.DownFun(this._codes.code, "county");
        }
      }
    }
  }
  async leftClickEntityUp(movement, type) {
    const pickedObject = this._viewer.scene.pick(movement.position);
    if (
      typeof pickedObject == "undefined" ||
      (Cesium.defined(pickedObject) &&
        pickedObject.id instanceof Cesium.Entity &&
        pickedObject.id.id !== this.pickedId)
    ) {
      if (type == "city") {
        // 移除父级区域
        this.removeEntity();
        await this.ChangeFun(this._codes.pCode, "province");
        this.provinceDataSource(JSON.parse(JSON.stringify(this._province)));
        this.UpFun(this._codes.pCode, "province");
      } else if (type == "county") {
        if (this._type == "county") {
          return;
        }
        // 移除父级区域
        this.removeEntity();
        await this.ChangeFun(this._codes.cCode, "city");
        this.cityDataSource(JSON.parse(JSON.stringify(this._city)));
        this.UpFun(this._codes.cCode, "city");
      }
    }
  }
  // 加载省
  provinceDataSource = (data) => {
    if (!data) {
      return;
    }

    // 移除事件监听和高亮显示
    this.destroy();
    this.clearDataSources();
    const dataSourcePromise = Cesium.GeoJsonDataSource.load(data).then(
      (dataSource) => {
        this._dataSource = dataSource;
        this._viewer.dataSources.add(dataSource);
        this._viewer.zoomTo(
          dataSource,
          new Cesium.HeadingPitchRange(0.0, Cesium.Math.toRadians(-65), 0)
        );
        this.setEntityHighlight(dataSource, "province");
      }
    );
    // 单击
    this._viewer.screenSpaceEventHandler.setInputAction(async (event) => {
      await this.leftClickEntityDown(event, "province");
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  // 加载市
  cityDataSource = (data) => {
    if (!data) {
      return;
    }
    // 移除事件监听和高亮显示
    this.destroyAllEvents();
    this.clearDataSources();
    var dataSourcePromise = Cesium.GeoJsonDataSource.load(data).then(
      (dataSource) => {
        this._dataSource = dataSource;
        this._viewer.dataSources.add(dataSource);
        this._viewer.zoomTo(dataSource);
        this.setEntityHighlight(dataSource, "city");
      }
    );
    // 单击
    this._viewer.screenSpaceEventHandler.setInputAction(async (event) => {
      await this.leftClickEntityDown(event, "city");
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this._viewer.screenSpaceEventHandler.setInputAction(async (event) => {
      await this.leftClickEntityUp(event, "city");
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  };
  // 加载县
  countyDataSource = (data) => {
    if (!data) {
      return;
    }
    // 移除事件监听和高亮显示
    this.destroy();
    this.clearDataSources();
    var dataSourcePromise = Cesium.GeoJsonDataSource.load(data).then(
      (dataSource) => {
        this._dataSource = dataSource;
        this._viewer.dataSources.add(dataSource);
        this._viewer.zoomTo(dataSource);
        this.setEntityHighlight(dataSource, "county");
      }
    );

    this._viewer.screenSpaceEventHandler.setInputAction(async (event) => {
      await this.leftClickEntityUp(event, "county");
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  };
}
