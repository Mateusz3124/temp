const { measurePing } = require("./ping");

const pingMeasurement = measurePing();

setTimeout(() => {
  pingMeasurement.stop();
  const stats = pingMeasurement.stats();

  console.log("Ping statistics:");
  console.log("Total packets:", stats.packetCount);
  console.log("Received packets:", stats.receivedPacketCount);
  console.log("Lost packets:", stats.lostPacketCount);
  console.log("Minimum ping time:", stats.minTime, "ms");
  console.log("Maximum ping time:", stats.maxTime, "ms");
  console.log("Average ping time:", stats.avgTime, "ms");
  process.exit(0);
}, 5000);
