const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const productRoutes = require("./src/routes/productRoutes");

const app = express();

// CORS Configuration
const corsOptions = {
  // Allow origins with http:// or https:// schemes
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:8080",
      "https://localhost:3000",
      "https://localhost:8080",
      "https://gcr-ci-cd-staging-937004112524.us-central1.run.app",
      process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []
    ].flat().filter(Boolean);

    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600, // 1 hour
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

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
