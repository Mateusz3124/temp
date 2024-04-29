var axios = require("axios");

axios.get("https://tvgo.orange.pl/gpapi/status").then((response) => {
  console.log("hello");
});
