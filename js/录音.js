const record = document.getElementById("record"); // 获取开始录音按钮
const player = document.getElementById("player"); // 获取播放录音按钮

// 预先设置一个变量来存MediaRecorder实例对象
let mediaRecorder = null;
let urlFile = null; // 录制好的音频，用于传给后端
// 首先打开麦克风，并进行监听
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(
    (stream) => {
      let chunks = []; // 存储录制的音频
      mediaRecorder = new MediaRecorder(stream);

      // 录音开始事件监听（即调用 mediaRecorder.start()时会触发该事件）
      mediaRecorder.onstart = () => {
        console.log("录音开始");
      };

      // 录音可用事件监听，发生于mediaRecorder.stop()调用后，mediaRecorder.onstop 前
      mediaRecorder.ondataavailable = (e) => {
        console.log("dataavailable");
        chunks.push(e.data);
      };

      // 录音结束事件监听，发生在mediaRecorder.stop()和 mediaRecorder.ondataavailable 调用后
      mediaRecorder.onstop = () => {
        let blob = new Blob(chunks, { type: "audio/webm;codecs=opus" }); // 获取到录音的blob
        urlFile = new window.File([blob], "record.webm"); // 将blob转换为file对象，名字可以自己改，一般用于需要将文件上传到后台的情况
        let url = (window.URL || webkitURL).createObjectURL(blob); // 将blob转换为地址，一般用于页面上面的回显，这个url可以直接被 audio 标签使用
        player.src = url; // 将录制好的音频赋值给播放器
      };
    },
    (err) => {
      alert("授权失败：", err);
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
  console.log("录音器状态：", mediaRecorder);
};
