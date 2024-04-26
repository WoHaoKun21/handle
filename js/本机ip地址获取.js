const os = require("os");

let ip = "";
const networkInterfaces = os.networkInterfaces();

Object.values(networkInterfaces).map((infoList) => {
  infoList.map((ipInfo) => {
    if (
      ipInfo.family === "IPv4" &&
      !ipInfo.internal &&
      ipInfo.address !== "127.0.0.1"
    ) {
      ip = ipInfo.address;
    }
  });
});

console.log("电脑ip地址：", ip);
