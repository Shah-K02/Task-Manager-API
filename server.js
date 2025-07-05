const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const { errorHandler } = require("./middleware/errorMiddleware");
app.use(errorHandler);

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
