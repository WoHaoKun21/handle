let mediaRecorder; // 录音实例
const chunks = []; // 录音文件
const record = document.getElementById("record"); // 获取开始录音按钮
const playBtn = document.getElementById("player"); // 获取播放录音按钮

// 获取录音权限
if (navigator.mediaDevices.getUserMedia) {
  const constraints = { audio: true }; // 录音约束配置
  navigator.mediaDevices.getUserMedia(constraints).then(
    (stream) => {
      // stream为录音媒体对象
      mediaRecorder = new MediaRecorder(stream);
      console.log("授权成功对象：", mediaRecorder);
      // 监听录音事件
      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
      };
      mediaRecorder.onstop = (e) => {
        console.log("暂停：", chunks);
        // const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        // chunks = [];
        // const audioURL = window.URL.createObjectURL(blob);
        // audio.src = audioURL;
      };
    },
    (err) => {
      console.log("授权失败：", err);
    }
  );
} else {
  alert("您的浏览器不支持录音功能");
}

// 开始/暂停录音
record.onclick = () => {
  if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    record.textContent = "开始";
    console.log("录音结束");
  } else {
    mediaRecorder.start();
    console.log("录音中...");
    record.textContent = "停止";
  }
  console.log("录音器状态：", mediaRecorder.state, chunks);
};
