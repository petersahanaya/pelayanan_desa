const https = require("https");
const fs = require("fs");
const { parse } = require("url");
const next = require("next");

const dev = false;
const hostname = "0.0.0.0";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const sslOptions = {
  key: fs.readFileSync("certificates/localhost-key.pem"),
  cert: fs.readFileSync("certificates/localhost.pem"),
};

app.prepare().then(() => {
  https
    .createServer(sslOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
    });
});
