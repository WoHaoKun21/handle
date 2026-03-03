//m3u8在线播放地址：https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8
const m3u8testUrl =
  "https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8";
const videoList = document.getElementsByClassName("video");

// 获取视频关键帧饼返回图片链接
const getHLSFrame = (m3u8Url, frameNumber = 10, fps = 25) => {
  return new Promise((resolve, reject) => {
    if (!Hls.isSupported()) {
      reject(new Error("当前浏览器不支持 HLS 播放"));
      return;
    }

    // 计算目标时间（秒）
    const targetTime = (frameNumber - 1) / fps;
    console.log(
      `目标时间: ${targetTime.toFixed(3)}秒 (第${frameNumber}帧, ${fps}fps)`,
    );

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.style.display = "none";
    document.body.appendChild(video);

    const hls = new Hls({
      startLevel: 0, // 从最低码率开始
      maxBufferLength: 30, // 允许缓冲30秒，以便跳转
      maxMaxBufferLength: 60,
      enableWorker: true,
    });

    const cleanup = () => {
      hls.destroy();
      if (video.parentNode) video.parentNode.removeChild(video);
    };

    // 视频元数据加载完成
    video.addEventListener("loadedmetadata", () => {
      console.log("视频信息:", {
        宽: video.videoWidth,
        高: video.videoHeight,
        时长: video.duration,
        帧率估算: fps,
      });
    });

    // 监听进度事件，确保数据足够跳转
    let seekAttempts = 0;
    const maxSeekAttempts = 5;

    const attemptSeek = () => {
      if (video.readyState >= 2) {
        // HAVE_CURRENT_DATA 或更高
        // 跳转到目标时间
        video.currentTime = targetTime;
      } else if (seekAttempts < maxSeekAttempts) {
        seekAttempts++;
        console.log(
          `缓冲中，等待数据... (尝试 ${seekAttempts}/${maxSeekAttempts})`,
        );
        setTimeout(attemptSeek, 500);
      } else {
        cleanup();
        reject(new Error("无法缓冲到目标时间位置"));
      }
    };

    // 监听跳转完成
    video.addEventListener(
      "seeked",
      function onSeeked() {
        // 确认是否接近目标时间（允许微小误差）
        const currentTime = video.currentTime;
        const timeDiff = Math.abs(currentTime - targetTime);
        if (timeDiff > 0.5) {
          console.warn(
            `实际跳转到 ${currentTime.toFixed(3)}秒，与目标 ${targetTime.toFixed(3)}秒有差异`,
          );
        }
        // 截图
        setTimeout(() => {
          // 给视频一点点渲染时间
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1920;
          canvas.height = video.videoHeight || 1080;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                resolve(blobUrl);
              } else {
                reject(new Error("Canvas转换失败"));
              }
              cleanup();
            },
            "image/jpeg",
            0.9,
          );
        }, 100);

        video.removeEventListener("seeked", onSeeked);
      },
      { once: true },
    );

    // 跳转失败处理
    video.addEventListener("error", (e) => {
      cleanup();
      reject(new Error(`视频错误: ${video.error?.message || "未知"}`));
    });

    // 开始加载
    hls.loadSource(m3u8Url);
    hls.attachMedia(video);

    // 等待足够的数据后尝试跳转
    video.addEventListener("canplay", attemptSeek, { once: true });
  });
};

// ---------- 使用示例 ----------
const setCover = async () => {
  try {
    for (let i = 0; i < videoList.length; i++) {
      const element = videoList[i];
      const m3u8DomUrl = element.getAttribute("data-src");
      const coverBlobUrl = await getHLSFrame(m3u8DomUrl);
      videoList[i].children[0].src = coverBlobUrl;
      videoList[i].children[0].onload = () => URL.revokeObjectURL(coverBlobUrl);
    }
  } catch (error) {
    console.error("获取封面失败:", error);
    // 可以显示默认图片
    document.getElementById("cover-image").src = "./img/1.jpg";
  }
};

setCover();
