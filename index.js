import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./startup/db.js";
dbConnect();
import startupRoutes from "./startup/routes.js";
startupRoutes(app);
import logging from "./startup/logging.js";
logging();

app.get("/test", (req, res) => {
  res.send("API is working");
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
