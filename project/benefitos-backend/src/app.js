const express = require("express");
const cors = require("cors");
const intelRoutes = require("./routes/intelligenceRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors()); // Critical to allow connection from local Expo app
app.use(express.json());

// Bind versioned paths
app.use("/api", intelRoutes);
app.use("/api", workflowRoutes);
// Log registered routes for debugging and verification
console.log('🚦 Registered routes:');
console.log('  GET /api/welfare-score/:citizenId');
console.log('  GET /api/missed-benefits/:citizenId');
console.log('  GET /api/claimed-schemes/:citizenId');
console.log('  GET /api/readiness/:citizenId');
console.log('  GET /api/roadmap/:citizenId');
console.log('  GET /api/family-optimizer/:citizenId');

// Base Health Check Route
app.get("/health", (req, res) =>
  res.json({ status: "GREEN", engine: "BenefitOS Core Engine Active" }),
);

app.use(errorHandler);

module.exports = app;
