import express from "express";
import Users from "../models/user.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

router.get("/all-users", auth, admin, async (req, res) => {
  const users = await Users.find().select("-password");
  res.send(users);
});

export default router;
