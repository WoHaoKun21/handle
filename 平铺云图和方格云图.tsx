import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import classNames from "classnames";
import "leaflet/dist/leaflet.css";
import styles from "./WeatherRadar.module.less";

interface WeatherDataItem {
  lat: number;
  lon: number;
  val: number;
  time: string;
}

interface GroupedData {
  [time: string]: WeatherDataItem[];
}

const colorScale = [
  { val: 0.1, color: [0, 0, 255, 0] },
  { val: 0.5, color: [0, 160, 245, 120] },
  { val: 1.5, color: [0, 240, 0, 180] },
  { val: 3.0, color: [250, 250, 0, 210] },
  { val: 5.0, color: [255, 120, 0, 230] },
  { val: 7.0, color: [255, 0, 0, 245] },
  { val: 10.0, color: [180, 0, 180, 255] },
];

const getColorForValue = (val: number) => {
  if (val < colorScale[0].val) return [0, 0, 0, 0];
  for (let i = 0; i < colorScale.length - 1; i++) {
    const curr = colorScale[i];
    const next = colorScale[i + 1];
    if (val >= curr.val && val <= next.val) {
      const t = (val - curr.val) / (next.val - curr.val);
      return [
        Math.round(curr.color[0] + (next.color[0] - curr.color[0]) * t),
        Math.round(curr.color[1] + (next.color[1] - curr.color[1]) * t),
        Math.round(curr.color[2] + (next.color[2] - curr.color[2]) * t),
        Math.round(curr.color[3] + (next.color[3] - curr.color[3]) * t),
      ];
    }
  }
  return colorScale[colorScale.length - 1].color;
};

const WeatherRadar: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 数据状态
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [timeList, setTimeList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 控制状态
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [renderMode, setRenderMode] = useState<"smooth" | "grid">("smooth");

  // 1. 初始化 Leaflet 地图与载入 JSON 数据
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 创建地图实例
    const map = L.map(mapContainerRef.current).setView([30.0, 120.0], 9);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    ).addTo(map);
    mapRef.current = map;

    // 动态添加图例
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "weather-legend");
      div.innerHTML += `<strong>降水量 (mm)</strong>`;
      colorScale.forEach((curr, i) => {
        const next = colorScale[i + 1];
        const rgbStr = `rgba(${curr.color.slice(0, 3).join(",")}, 0.9)`;
        div.innerHTML += `<i style="background: ${rgbStr}"></i> ${curr.val}${next ? ` &ndash; ${next.val}<br>` : "+"}`;
      });
      return div;
    };
    legend.addTo(map);

    // 获取并分组气象数据
    fetch("/weatherData.json") // 请确保文件放置在 public 目录下
      .then((res) => res.json())
      .then((rawData: WeatherDataItem[]) => {
        const groups: GroupedData = {};
        rawData.forEach((item) => {
          if (!groups[item.time]) groups[item.time] = [];
          groups[item.time].push(item);
        });

        const sortedTimes = Object.keys(groups).sort();
        setGroupedData(groups);
        setTimeList(sortedTimes);
        setLoading(false);
      })
      .catch((err) => console.error("加载气象 JSON 错误:", err));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // 2. 核心渲染逻辑：当时间指针、渲染模式或数据源改变时，执行 Canvas 重绘纹理
  useEffect(() => {
    if (timeList.length === 0 || !mapRef.current) return;

    const currentTime = timeList[currentIndex];
    const currentData = groupedData[currentTime];
    if (!currentData) return;

    // 提取经纬格点网格边界
    const lats = currentData.map((d) => d.lat);
    const lons = currentData.map((d) => d.lon);
    const bounds: L.LatLngBoundsExpression = [
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)],
    ];

    const uniqueLats = [...new Set(lats)].sort((a, b) => b - a);
    const uniqueLons = [...new Set(lons)].sort((a, b) => a - b);
    const width = uniqueLons.length;
    const height = uniqueLats.length;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 建立一维映射字典提高检索速度
    const dataMap: { [key: string]: number } = {};
    currentData.forEach((d) => {
      dataMap[`${d.lat.toFixed(2)}_${d.lon.toFixed(2)}`] = d.val;
    });

    if (renderMode === "smooth") {
      // 模式 A: 平铺平滑云图
      canvas.width = width;
      canvas.height = height;
      const imgData = ctx.createImageData(width, height);

      for (let y = 0; y < height; y++) {
        const lat = uniqueLats[y];
        for (let x = 0; x < width; x++) {
          const lon = uniqueLons[x];
          const val = dataMap[`${lat.toFixed(2)}_${lon.toFixed(2)}`] || 0;
          const color = getColorForValue(val);
          const pixelIndex = (y * width + x) * 4;

          imgData.data[pixelIndex] = color[0];
          imgData.data[pixelIndex + 1] = color[1];
          imgData.data[pixelIndex + 2] = color[2];
          imgData.data[pixelIndex + 3] = color[3];
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else {
      // 模式 B: 科技感离散方格网格
      const scale = 12;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.imageSmoothingEnabled = false; // 关闭反锯齿，呈现硬边方块

      for (let y = 0; y < height; y++) {
        const lat = uniqueLats[y];
        for (let x = 0; x < width; x++) {
          const lon = uniqueLons[x];
          const val = dataMap[`${lat.toFixed(2)}_${lon.toFixed(2)}`] || 0;

          if (val >= colorScale[0].val) {
            const color = getColorForValue(val);
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
            // 扣除 1 像素物理缝隙空隙凸显方阵感
            ctx.fillRect(x * scale, y * scale, scale - 1, scale - 1);
          }
        }
      }
    }

    const imageUrl = canvas.toDataURL();

    // 无缝单图层材质重置，杜绝白屏闪烁
    if (overlayRef.current) {
      overlayRef.current.setUrl(imageUrl);
      overlayRef.current.setBounds(bounds);
    } else {
      overlayRef.current = L.imageOverlay(imageUrl, bounds, {
        opacity: 0.85,
        interactive: false,
      }).addTo(mapRef.current);
      mapRef.current.fitBounds(bounds);
    }
  }, [currentIndex, renderMode, timeList, groupedData]);

  // 3. 时间轴轮播定时器管理
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % timeList.length);
      }, 1200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeList]);

  // 交互处理器
  const handlePlayToggle = () => setIsPlaying(!isPlaying);
  const handleModeToggle = () =>
    setRenderMode((m) => (m === "smooth" ? "grid" : "smooth"));
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false); // 手动拖拽时贴心暂停
    setCurrentIndex(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div
        style={{
          color: "#fff",
          padding: "20px",
          background: "#0f141d",
          height: "100vh",
        }}
      >
        时序气象格点解析中...
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      {/* 地图挂载容器 */}
      <div ref={mapContainerRef} />

      {/* 控制中心大屏面板 */}
      <div className={styles.controlPanel}>
        <button
          className={classNames(styles.btn, styles.playBtn)}
          onClick={handlePlayToggle}
        >
          {isPlaying ? "⏸ 暂停" : "▶ 播放"}
        </button>

        <button
          className={classNames(styles.btn, styles.modeBtn, {
            [styles.activeGrid]: renderMode === "grid",
          })}
          onClick={handleModeToggle}
        >
          {renderMode === "smooth" ? "🔮 平铺云图" : "🟩 方格网格"}
        </button>

        <input
          className={styles.timelineSlider}
          type="range"
          min={0}
          max={timeList.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
        />

        <div className={styles.timeDisplay}>
          ⏱ {timeList[currentIndex]?.substring(0, 16)}
        </div>
      </div>
    </div>
  );
};

export default WeatherRadar;
