import express from "express";
import users from "../routes/users.js";
import auth from "../routes/auth.js";
import workers from "../routes/workers.js";
import customers from "../routes/customers.js";
import jobs from "../routes/jobs.js";
import error from "../middleware/error.js";

export default function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/workers", workers);
  app.use("/api/customers", customers);
  app.use("/api/jobs", jobs);
  app.use(error);
}
