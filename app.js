const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js Express API",
      version: "1.0.0",
      description: "A simple Node.js/Express web server with Swagger documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: [__filename],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns a welcome message
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: Successfully retrieved the home page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
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
      <p>This is a simple Node/Express Js web server.</p>
    </body>
    `);
  next();
});

module.exports = app;
