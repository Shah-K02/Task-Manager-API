const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();
console.log("MONGO_URI:", process.env.MONGO_URI); // <-- TEMP TEST

const app = express();

// Your other middleware/routes here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
