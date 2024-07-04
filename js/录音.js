let mediaRecorder; // 录音实例
const record = document.getElementById("record"); // 获取开始录音按钮

record.onclick = () => {
  if (navigator.mediaDevices.getUserMedia) {
    const constraints = { audio: true }; // 录音约束配置
    navigator.mediaDevices.getUserMedia(constraints).then(
      (stream) => {
        // stream为录音媒体对象
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        console.log("授权成功对象：", mediaRecorder);
      },
      (err) => {
        console.log("授权失败：", err);
      }
    );
  } else {
    alert("您的浏览器不支持录音功能");
  }
};
