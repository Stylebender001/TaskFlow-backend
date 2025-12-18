import express from "express";
import users from "../routes/users.js";
import auth from "../routes/auth.js";
import workers from "../routes/workers.js";
import customers from "../routes/customers.js";
import jobs from "../routes/jobs.js";
import error from "../middleware/error.js";
import admin from "../routes/admin.js";

export default function (app) {
  app.use(express.json());
  app.use("/api/signup", users);
  app.use("/api/login", auth);
  app.use("/api/workers", workers);
  app.use("/api/customers", customers);
  app.use("/api/jobs", jobs);
  app.use("/api/admin", admin);
  app.use(error);
}
