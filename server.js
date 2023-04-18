const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const CSVToJSON = require("csvtojson");

const logDir = path.resolve(__dirname, "./logs");
const commentCSV = path.resolve(logDir, "comment.csv");
const reportViolationsCSV = path.resolve(logDir, "report-violations.csv");
const config = JSON.parse(fs.readFileSync("package.json")).config;

const server = express();

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

if (!fs.existsSync(reportViolationsCSV)) {
  fs.writeFileSync(reportViolationsCSV, "time,url,data\n", {
    flag: "wx",
  });
}

if (!fs.existsSync(commentCSV)) {
  fs.writeFileSync(commentCSV, "time,comment\n", {
    flag: "wx",
  });
}

server.post(
  "/api/report-violations",
  bodyParser.json({ type: "*/*" }),
  (req, res, next) => {
    const now = new Date().getTime();
    const URL = req.protocol + "://" + req.get("host") + req.originalUrl;
    const record = `${now},${URL},${JSON.stringify(req.body)}`;

    fs.appendFile(reportViolationsCSV, `${record}\n`, (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
      next();
    });
  }
);

server.post(
  "/api/comment",
  bodyParser.json({ type: "*/*" }),
  (req, res, next) => {
    const now = new Date().getTime();
    const record = `${now},${req.body.comment}`;

    fs.appendFile(commentCSV, `${record}\n`, (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
      next();
    });
  }
);

server.get("/api/comment", (req, res) => {
  CSVToJSON()
    .fromFile("./logs/comment.csv")
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      console.log(err);
    });
});

server.use("/xss", express.static(__dirname + "/xss"));
server.use(express.static(__dirname + "/public"));

const port = parseInt(config["port"], 10);

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/`);
});
