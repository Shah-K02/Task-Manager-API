const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log database name]
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C) to gracefully close the connection
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed");
  process.exit(0);
});

// Handle SIGTERM (for graceful shutdown in production)
process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed on SIGTERM");
  process.exit(0);
});

module.exports = connectDB;
