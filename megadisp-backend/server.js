require("dotenv").config({ path: "./.env" }); // force dotenv to load

const express = require("express");
const cors = require("cors");

const megawattRoutes = require("./routes/megawatt"); // your API router

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/megawatt", megawattRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "megadisp" });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`megadisp backend running on port ${PORT}`);
});
