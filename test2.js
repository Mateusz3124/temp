var validate = require("jsonschema").validate;
const { request } = require("http");
const { tcpPing } = require("./tcpPing.js");
const fs = require("fs");

const url = new URL("https://tvgo.orange.pl/gpapi/status");
const hostname = url.hostname;
const repetitions = 10;
const timeOffset = 5 * 1000;

const schema = {
  type: "object",
  properties: {
    ahS: { type: "string" },
    aS: { type: "string" },
    gS: { type: "string" },
    iaS: { type: "string" },
    lS: { type: "string" },
    nS: { type: "string" },
  },
  required: ["ahS", "aS", "gS", "iaS", "lS", "nS"],
};

const pingMeasure = tcpPing(hostname);

const formatTime = (time) => {
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, "0");
  const day = String(time.getDate()).padStart(2, "0");

  const hour = String(time.getHours()).padStart(2, "0");
  const minute = String(time.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}:${hour}:${minute}`;
};

const writeToFile = (text) => {
  fs.appendFile("log.txt", text + "\n", function (err) {
    if (err) {
      console.log("Nie mozna zapisac do pliku");
    }
  });
};

const validateResponse = (response, sendDate) => {
  var time = new Date();
  const latency = time.getTime() - sendDate;
  if (response.status === 200) {
    regex = /json/
    const match = response.headers.get("content-type").match(regex);
    if (match) {
      if (validate(response.data, schema).valid) {
        const text = `Czas: ${formatTime(
          time
        )}. Opoznienie zapytania: ${latency} ms. Prawidlowa struktura`;
        console.log(text);
        writeToFile(text);
      } else {
        const text = `Czas: ${formatTime(
          time
        )}. Opoznienie zapytania: ${latency} ms. Nieprawidlowa struktura`;
        console.log(text);
        writeToFile(text);
      }
    } else {
      const text = `Czas: ${formatTime(
        time
      )}. Opoznienie zapytania: ${latency} ms. Nieprawidlowy typ odpowiedzi, odpowiedz typu: ${response.headers.get(
        "content-type"
      )}`;
      console.log(text);
      writeToFile(text);
    }
  } else {
    const text = `Czas: ${formatTime(
      time
    )}. Opoznienie zapytania: ${latency} ms. Nieprawidlowy blad odpowiedzi: ${
      response.status
    }`;
    console.log(text);
    writeToFile(text);
  }
};

const formatPing = (pingValues, time) => {
  return `Czas: ${formatTime(time)}. Ilocs wyslanych pakietow: ${
    pingValues.packetCount
  }, odebranych: ${pingValues.receivedPacketCount} i straconych: ${
    pingValues.lostPacketCount
  }, czas bladzenia pakietow minimalny: ${pingValues.minTime}, maksymalny: ${
    pingValues.maxTime
  } i średni: ${pingValues.avgTime}`;
};

let counter = 0;
const interval = setInterval(async () => {
  if (counter === repetitions) {
    const currentTime = new Date();
    const formattedPing = formatPing(pingMeasure.stop(), currentTime);
    writeToFile(formattedPing);
    console.log(formattedPing);
    clearInterval(interval);
    return;
  }
  const sendDate = new Date().getTime();
  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      validateResponse(response, sendDate);
    })
    .catch((error) => {
      let time = new Date();
      const latency = time.getTime() - sendDate;
      const text = `Czas: ${formatTime(
        time
      )}. Opoznienie zapytania: ${latency} ms. Problem z polaczeniem, blad: ${error}`;
      console.log(text);
      writeToFile(text);
    });
  counter++;
}, timeOffset);
