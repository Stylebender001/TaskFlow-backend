import express from "express";
import Users from "../models/user.js";
import validateUser from "../validation/user.js";
import _ from "lodash";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  user = new Users(_.pick(req.body, ["username", "email", "password", "role"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user = await user.save();
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(req.body, ["_id", "username", "email", "role"]));
});

export default router;
