var validate = require("jsonschema").validate;
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

const formatPing = (pingValues, time) => {
  return `Czas: ${formatTime(time)}. Ilosc wyslanych pakietow: ${
    pingValues.packetCount
  }, odebranych: ${pingValues.receivedPacketCount}, straconych: ${
    pingValues.lostPacketCount
  }. Czas bladzenia pakietow minimalny: ${pingValues.minTime}, maksymalny: ${
    pingValues.maxTime
  } i średni: ${pingValues.avgTime}`;
};

const writeToFile = (text) => {
  fs.appendFile("log.txt", text + "\n", function (err) {
    if (err) {
      console.log("Nie mozna zapisac do pliku");
    }
  });
};

const validateResponse = (response, latency) => {
  let time = new Date();
  if (response.status === 200) {
    regex = /json/;
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
      let time = new Date();
      const latency = time.getTime() - sendDate;
      validateResponse(response, latency);
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
