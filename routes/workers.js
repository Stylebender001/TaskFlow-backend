import express from "express";
import auth from "../middleware/auth.js";
import worker from "../middleware/workers.js";
import Workers from "../models/workers.js";
import { validateWorker } from "../validation/worker.js";
const router = express.Router();

router.post("/setup", auth, worker, async (req, res) => {
  if (req.user.role !== "worker")
    return res.status(403).send("Access denied — not a worker.");
  const userId = req.user._id;
  let worker = await Workers.findOne({ user: userId });
  if (worker) return res.status(400).send("Worker profile already existed");
  const { error } = validateWorker(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  worker = new Workers({
    user: userId,
    skills: req.body.skills,
    location: req.body.location,
  });

  await worker.save();
  res.send(worker);
});

router.get("/profile", auth, worker, async (req, res) => {
  if (req.user.role !== "worker")
    return res.status(403).send("Access denied — not a worker.");
  const workerProfile = await Workers.findOne({ user: req.user._id }).populate(
    "user",
    "username"
  );
  res.send(workerProfile);
});

router.put("/setup", auth, worker, async (req, res) => {
  if (req.user.role != "worker")
    return res.status(403).send("Access denied — not a worker.");
  const userId = req.user._id;
  const { error } = validateWorker(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const updatedWorker = await Workers.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      skills: req.body.skills,
      location: req.body.location,
    },
    { new: true }
  );
  res.send(updatedWorker);
});

export default router;
