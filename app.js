const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res, next) => {
  res.setHeader("Content-type", "text/html");
  res.send(`
    <html>
      <head>
        <title>Node Js Web Serve Version 3</title>
      </head>
    </html>
    <body>
      <!-- <h1>Hello world! I'm a Node/Express Js web server version 2...</h1> -->
      <h1>Hello world! I'm speaking with Mr. Ben!...</h1>
    </body>
    `);
  next();
});

module.exports = app;
