import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import HeatmapOverlay from "leaflet-heatmap"; // 确保已通过 npm install leaflet-heatmap 安装
import "leaflet/dist/leaflet.css";

const RainMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const heatmapLayer = useRef(null);
  const timerRef = useRef(null);

  // 状态管理
  const [data, setData] = useState([]); // 原始降雨数据
  const [timeSeries, setTimeSeries] = useState([]); // 时间轴序列
  const [currentIndex, setCurrentIndex] = useState(0); // 当前时间索引
  const [hoursType, setHoursType] = useState(3); // 3h 或 6h
  const [isPlaying, setIsPlaying] = useState(false);

  // 天地图 Key
  const TDT_KEY = "YOUR_TDT_KEY";

  // 1. 初始化地图和热力图层
  useEffect(() => {
    if (!mapInstance.current) {
      const map = L.map(mapRef.current, { zoomControl: false }).setView(
        [29.0, 118.5],
        8,
      );

      // 天地图底图
      L.tileLayer(
        `http://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TDT_KEY}`,
      ).addTo(map);
      L.tileLayer(
        `http://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TDT_KEY}`,
      ).addTo(map);

      // 热力图配置
      const cfg = {
        radius: 0.15,
        maxOpacity: 0.8,
        scaleRadius: true,
        useLocalExtrema: false,
        latField: "lat",
        lngField: "lon",
        valueField: "val",
        gradient: { ".2": "#31ff31", ".5": "#ffff00", "1": "#ff0000" },
      };

      heatmapLayer.current = new HeatmapOverlay(cfg);
      map.addLayer(heatmapLayer.current);
      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) mapInstance.current.remove();
    };
  }, []);

  // 2. 接口请求数据
  useEffect(() => {
    const fetchData = async () => {
      stopPlay();
      try {
        const response = await fetch(
          `http://211.90.240.131:3100/jy/rainSeries?type=${hoursType}`,
        );
        const resData = await response.json();

        const times = [...new Set(resData.map((item) => item.time))].sort();
        setData(resData);
        setTimeSeries(times);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [hoursType]);

  // 3. 当索引改变时，渲染对应的热力图帧
  useEffect(() => {
    if (data.length > 0 && timeSeries.length > 0) {
      const currentTime = timeSeries[currentIndex];
      const frameData = data.filter((d) => d.time === currentTime);

      heatmapLayer.current.setData({
        max: 4,
        data: frameData,
      });
    }
  }, [currentIndex, data, timeSeries]);

  // 4. 播放控制器逻辑
  const togglePlay = () => {
    if (isPlaying) {
      stopPlay();
    } else {
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % timeSeries.length);
      }, 800);
    }
  };

  const stopPlay = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 地图容器 */}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* 左侧雨量条图例 */}
      <div style={styles.legend}>
        <div style={styles.legendTitle}>
          降水
          <br />
          强度
        </div>
        <div style={styles.legendLabel}>大雨</div>
        <div style={styles.gradientBar} />
        <div style={styles.legendLabel}>小雨</div>
      </div>

      {/* 底部时间控制台 */}
      <div style={styles.timePanel}>
        <div style={styles.timeHeader}>
          <button style={styles.playBtn} onClick={togglePlay}>
            {isPlaying ? "||" : "▶"}
          </button>
          <div style={styles.timeDisplay}>
            {timeSeries[currentIndex] || "--:--"}
          </div>
          <div style={styles.btnGroup}>
            {[3, 6].map((h) => (
              <button
                key={h}
                onClick={() => setHoursType(h)}
                style={{
                  ...styles.typeBtn,
                  backgroundColor: hoursType === h ? "#007aff" : "transparent",
                  color: hoursType === h ? "white" : "#666",
                }}
              >
                {h}H
              </button>
            ))}
          </div>
        </div>
        <div style={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max={timeSeries.length - 1 || 0}
            value={currentIndex}
            onChange={(e) => {
              stopPlay();
              setCurrentIndex(parseInt(e.target.value));
            }}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
};

// 简单的内联样式对象
const styles = {
  legend: {
    position: "absolute",
    left: "20px",
    top: "100px",
    zIndex: 1000,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
  },
  legendTitle: { fontSize: "12px", color: "#666", marginBottom: "5px" },
  gradientBar: {
    width: "12px",
    height: "180px",
    margin: "0 auto",
    borderRadius: "6px",
    background:
      "linear-gradient(to top, #31ff31 0%, #ffff00 50%, #ff0000 100%)",
  },
  legendLabel: { fontSize: "11px", padding: "4px 0" },
  timePanel: {
    position: "absolute",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    width: "500px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  timeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  playBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
  },
  timeDisplay: { fontWeight: "bold", color: "#007aff", fontSize: "18px" },
  btnGroup: {
    backgroundColor: "#f0f0f0",
    borderRadius: "20px",
    padding: "2px",
  },
  typeBtn: {
    border: "none",
    padding: "5px 15px",
    borderRadius: "18px",
    cursor: "pointer",
    transition: "0.3s",
  },
  sliderContainer: { display: "flex", alignItems: "center" },
};

export default RainMap;
