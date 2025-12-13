import express from "express";
import Customers from "../models/customer.js";
import customer from "../middleware/customer.js";
import auth from "../middleware/auth.js";
import { validateCustomer } from "../validation/customer.js";
const router = express.Router();

router.post("/setup", auth, customer, async (req, res) => {
  if (req.user.role != "customer")
    return res.status(403).send("Access denied — not a customer.");
  const userId = req.user._id;
  let customer = await Customers.findOne({ user: userId });
  if (customer) return res.status(403).send("Customer Profile already exists.");
  const { error } = validateCustomer(req.body);
  if (error) return res.status(403).send(error.details[0].message);
  customer = new Customers({
    user: userId,
    location: req.body.location,
    phoneNo: req.body.phoneNo,
  });
  await customer.save();
  res.send(customer);
});

router.get("/profile", auth, customer, async (req, res) => {
  if (req.user.role != "customer")
    return res.status(403).send("Access denied — not a customer.");
  const customer = await Customers.findOne({ user: req.user._id }).populate(
    "user",
    "username"
  );
  res.send(customer);
});

router.put("/setup", auth, customer, async (req, res) => {
  if (req.user.role != "customer")
    return res.status(403).send("Access denied — not a customer.");
  const userId = req.user._id;
  const customer = await Customers.findOne({ user: userId });
  if (!customer) return res.status(403).send("Customer not found");
  const { error } = validateCustomer(req.body);
  if (error) return res.status(403).send(error.details[0].message);
  const updatedCustomer = await Customers.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      location: req.body.location,
      phoneNo: req.body.phoneNo,
    },
    { new: true }
  );
  res.send(updatedCustomer);
});

export default router;
