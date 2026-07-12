const express = require("express");
const cors = require("cors");

const intelRoutes = require("./routes/intelligenceRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/**
 * Allowed Origins
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:3000",
    ];

console.log("====================================");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Allowed Origins:", allowedOrigins);
console.log("====================================");

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin);
    console.log("Allowed Origins:", allowedOrigins);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Incoming Origin:", origin);

    // Allow requests without Origin
    if (!origin) {
      return callback(null, true);
    }

    try {
      const hostname = new URL(origin).hostname;

      // Allow any Bolt deployment
      if (hostname.endsWith(".bolt.host")) {
        console.log("Allowed Bolt Origin:", origin);
        return callback(null, true);
      }
    } catch (err) {
      console.error("Invalid Origin:", origin);
    }

    if (
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      console.log("Allowed Configured Origin:", origin);
      return callback(null, true);
    }

    console.error("Blocked Origin:", origin);

    return callback(new Error("Not allowed by CORS policy"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

/**
 * Routes
 */
app.use("/api", intelRoutes);
app.use("/api", workflowRoutes);
app.use("/api", authRoutes);
app.use("/api", notificationRoutes);
app.use("/api", citizenRoutes);

/**
 * Debug Routes
 */
const listRoutes = () => {
  console.log("=== Registered Express Routes ===");

  if (app._router && app._router.stack) {
    app._router.stack
      .filter((r) => r.route)
      .forEach((r) => {
        const methods = Object.keys(r.route.methods)
          .map((m) => m.toUpperCase())
          .join(", ");

        console.log(`${methods} ${r.route.path}`);
      });
  }
};

listRoutes();

const db = require("./config/db");

/**
 * Health Check
 */
app.get("/health", async (req, res) => {
  const dbHealth = await db.checkHealth();
  const dbStatus = dbHealth.status === "UP" ? "GREEN" : "RED";

  let sarvamStatus = "RED";
  let sarvamMsg = "Sarvam AI API key is not configured.";

  const sarvamKey = process.env.SARVAM_API_KEY;

  if (sarvamKey && sarvamKey.trim() !== "") {
    if (process.env.NODE_ENV === "test") {
      sarvamStatus = "GREEN";
      sarvamMsg = "Mock Sarvam AI active (test environment)";
    } else {
      try {
        const response = await fetch(
          "https://api.sarvam.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-subscription-key": sarvamKey,
            },
            body: JSON.stringify({
              model: process.env.SARVAM_MODEL || "sarvam-30b",
              messages: [{ role: "user", content: "ping" }],
              max_tokens: 1,
            }),
          },
        );

        if (response.ok) {
          sarvamStatus = "GREEN";
          sarvamMsg = "Sarvam AI Service is active and authorized.";
        } else {
          const errText = await response.text().catch(() => "");
          sarvamMsg = `Sarvam AI returned status ${response.status}: ${errText}`;
        }
      } catch (err) {
        sarvamMsg = `Sarvam AI is unreachable: ${err.message}`;
      }
    }
  }

  const overallStatus =
    dbStatus === "GREEN" && sarvamStatus === "GREEN" ? "GREEN" : "RED";

  res.status(overallStatus === "GREEN" ? 200 : 503).json({
    status: overallStatus,
    engine: "BenefitOS Core Engine Active",
    database: dbHealth,
    sarvam: {
      status: sarvamStatus,
      message: sarvamMsg,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      port: process.env.PORT || 5001,
      renderLoaded: !!(
        process.env.RENDER_SERVICE_ID || process.env.RENDER_API_KEY
      ),
    },
  });
});

app.use(errorHandler);

module.exports = app;
