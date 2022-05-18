const http = require("http");
require("dotenv").config();

const rpcCall = async (method, params) => {
  const postData = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method,
    params,
  });

  const options = {
    hostname: process.env.HOST || "localhost",
    port: 18232,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": " text/plain",
      "Content-Length": Buffer.byteLength(postData),
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.RPCUSER || "rpcuser"}:${
            process.env.RPCPASSWORD || "rpcpassword"
          }`
        ).toString("base64"),
    },
  };

  const req = http.request(options, (res) => {
    let data = "";

    res.setEncoding("utf8");
    res.on("data", (chunk) => (data += chunk));

    res.on("end", () => {
      let response;

      try {
        response = JSON.parse(data);
        console.log(response);
      } catch (error) {
        console.log(error);
      }

      if (response.error) {
        console.log(response.error);
      }
    });
  });

  req.write(postData);
  req.end();
};

(async () => {
  await rpcCall("getblock", ["1881238"]);
})();
