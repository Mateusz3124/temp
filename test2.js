var ping = require("ping");
let packetCount = 0;
let lostPacketCount = 0;
let receivedPacketCount = 0;
let minTime = Number.MAX_SAFE_INTEGER;
let maxTime = 0;
let sumTime = 0;
setInterval(async () => {
  const res = await ping.promise.probe("google.com");
  if (res.alive) {
    receivedPacketCount++;
    Math.min(minTime, res.time);
    Math.max(maxTime, res.time);
    sumTime += res.time;
  } else {
    lostPacketCount++;
  }
  packetCount++;
}, 1000);
setTimeout(() => {
    console.log({
        packetCount: packetCount !== -1 ? packetCount : 0.0,
        receivedPacketCount,
        lostPacketCount: lostPacketCount !== -1 ? lostPacketCount : 0.0,
        minTime: packetCount !== -1 ? minTime : 0.0,
        maxTime,
        avgTime:
          receivedPacketCount > 0 ? parseInt(sumTime / receivedPacketCount) : 0.0,
      }) 
      process.exit(0) ;  
}, 5000);
