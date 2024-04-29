var net = require("net");

let packetCount = 0;
let lostPacketCount = 0;
let receivedPacketCount = 0;
let minTime = Number.MAX_SAFE_INTEGER;
let maxTime = 0;
let sumTime = 0;
var config;

const tcpPing = (hostname) => {
  config = {
    host: hostname,
    port: 80,
    timeout: 4000,
  };

  const interval = setInterval(() => {
    connect();
  }, 1000);

  const callback = () => {
    clearInterval(interval);
    return {
      packetCount,
      receivedPacketCount,
      lostPacketCount: lostPacketCount !== -1 ? lostPacketCount : 0.0,
      minTime: packetCount !== 0 ? minTime : 0.0,
      maxTime,
      avgTime:
        receivedPacketCount > 0 ? parseInt(sumTime / receivedPacketCount) : 0.0,
    };
  };
  return {
    stop: callback,
  };
};

const connect = () => {
  packetCount++;
  let socket = new net.Socket();
  let sendDate = new Date().getTime();
  socket.setTimeout(config.timeout);
  socket.connect(config.port, config.host, () => {
    let time = new Date().getTime() - sendDate;
    receivedPacketCount++;
    minTime = Math.min(minTime, time);
    maxTime = Math.max(maxTime, time);
    sumTime += time;
    socket.destroy();
  });
  socket.on("error", () => {
    lostPacketCount++;
    socket.destroy();
  });
  socket.on("timeout", () => {
    lostPacketCount++;
    socket.destroy();
  });
};

module.exports = {
  tcpPing,
};
