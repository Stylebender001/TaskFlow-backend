import express from "express";
import auth from "../middleware/auth.js";
import customer from "../middleware/customer.js";
import worker from "../middleware/workers.js";
import Workers from "../models/workers.js";
import Jobs from "../models/job.js";
import Applications from "../models/application.js";
const router = express.Router();

//Customer Creates a Job Post.
router.post("/post", auth, customer, async (req, res) => {
  const job = new Jobs({
    customer: req.user._id,
    title: req.body.title,
    description: req.body.description,
    skillsRequired: req.body.skillsRequired,
    location: req.body.location,
  });
  await job.save();
  res.send(job);
});

//Worker Browses according to the skills.
router.get("/", auth, worker, async (req, res) => {
  const workerProfile = await Workers.findOne({ user: req.user._id });
  if (!workerProfile) return res.status(404).send("Worker profile not found");
  const jobs = await Jobs.find({
    status: "open",
    skillsRequired: { $in: workerProfile.skills },
  });
  res.send(jobs);
});

//Worker can apply to the job.
router.post("/:jobId/apply", auth, worker, async (req, res) => {
  const jobId = req.params.jobId;
  const workerId = req.user._id;
  const job = await Jobs.findById(jobId);
  if (!job) return res.status(404).send("Job not found");

  let existingApplication = await Applications.findOne({
    job: jobId,
    worker: workerId,
  });
  if (existingApplication)
    return res.status(400).send("You already applied for this job");
  const application = new Applications({
    job: jobId,
    worker: workerId,
    customer: job.customer,
  });
  await application.save();
  res.send("Applied successfully");
});

//Customer can view the workers who applied for the job.
router.get("/:jobId/applicants", auth, customer, async (req, res) => {
  const jobId = req.params.jobId;
  const job = await Jobs.findById(jobId);
  if (!job) return res.status(404).send("Job not found");
  if (job.customer.toString() !== req.user._id)
    return res.status(403).send("Access Denied");
  const applicants = await Applications.find({ job: jobId }).populate(
    "worker",
    "username skills"
  );
  res.send(applicants);
});

//Customer chooses the worker for the job
router.put("/:jobId/applicants/:appId", auth, customer, async (req, res) => {
  const jobId = req.params.jobId;
  const appId = req.params.appId;
  const status = req.body.status;

  const application = await Applications.findById(appId);
  if (!application) return res.status(404).send("Application not found");
  const job = await Jobs.findById(jobId);
  if (job.customer.toString() !== req.user._id.toString())
    return res.status(403).send("Access Denied");
  application.status = status;
  await application.save();
  if (status === "accepted") {
    job.assignedWorkers.push(application.worker);
    await job.save();
  }
  res.send(application);
});
export default router;
