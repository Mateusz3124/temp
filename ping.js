function measurePing() {
  const { spawn } = require("child_process");
  let ping;
  if(process.platform === "win32"){
    ping = spawn("ping", ["-t", "google.com"]);
  }
  else{
    ping = spawn("ping", ["google.com"]);
  } 
  // -1 due to first line of ping
  let packetCount = -1;
  let lostPacketCount = -1;
  let receivedPacketCount = 0;
  let minTime = Number.MAX_SAFE_INTEGER;
  let maxTime = 0;
  let sumTime = 0;

  var buffor = "";
  let regex = /time.\d+/;

  ping.stdout.on("data", (data) => {
    let dataString = data.toString();
    buffor += dataString;
    if (dataString.endsWith("\n")) {
      let match = buffor.match(regex);
      if (match) {
        let time = parseInt(match[0].slice(5, match[0].length));
        minTime = Math.min(minTime, time);
        maxTime = Math.max(maxTime, time);
        sumTime += time;
        receivedPacketCount++;
      } else {
        lostPacketCount++;
      }
      buffor = "";
      packetCount++;
    }
  });

  const callback = () => {
    process.kill(ping.pid, "SIGINT");
  };
  return {
    stop: callback,
    stats: () => ({
      packetCount: packetCount !== -1 ? packetCount : 0.0,
      receivedPacketCount,
      lostPacketCount: lostPacketCount !== -1 ? lostPacketCount : 0.0,
      minTime: packetCount !== -1 ? minTime : 0.0,
      maxTime,
      avgTime:
        receivedPacketCount > 0 ? parseInt(sumTime / receivedPacketCount) : 0.0,
    }),
  };
}

module.exports = {
  measurePing,
};
