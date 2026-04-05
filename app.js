const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const productRoutes = require("./src/routes/productRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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
        url: "http://localhost:8080",
        description: "Development server",
      },
    ],
  },
  apis: [__filename, "./src/controllers/*.js", "./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

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

/**
 * @swagger
 * /welcome:
 *   get:
 *     summary: Returns a welcome JSON message
 *     tags:
 *       - Welcome
 *     responses:
 *       200:
 *         description: Successfully retrieved welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *               example:
 *                 message: "Welcome to Node.js Express API"
 *                 timestamp: "2024-01-01T12:00:00Z"
 */
app.get("/welcome", (req, res) => {
  res.json({
    message: "Welcome to Node.js Express API",
    timestamp: new Date().toISOString(),
  });
});

// Product Routes
app.use("/api/products", productRoutes);

module.exports = app;
