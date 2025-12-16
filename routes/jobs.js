import express from "express";
import auth from "../middleware/auth.js";
import customer from "../middleware/customer.js";
import worker from "../middleware/workers.js";
import Workers from "../models/workers.js";
import Jobs from "../models/job.js";
import Applications from "../models/application.js";
import Reviews from "../models/rating.js";
import JOB_STATUS from "../constants/jobStatus.js";

const router = express.Router();

// Customer creates a job
router.post("/post", auth, customer, async (req, res) => {
  const job = new Jobs({
    customer: req.user._id,
    title: req.body.title,
    description: req.body.description,
    skillsRequired: req.body.skillsRequired,
    location: req.body.location,
    workersNeeded: req.body.workersNeeded || 1,
  });
  await job.save();
  res.send(job);
});

// Customer updates a job
router.put("/:id", auth, customer, async (req, res) => {
  const job = await Jobs.findById(req.params.id);
  if (!job) return res.status(404).send("Job not found");
  if (job.customer.toString() !== req.user._id.toString())
    return res.status(403).send("Access denied");

  job.title = req.body.title ?? job.title;
  job.description = req.body.description ?? job.description;
  job.skillsRequired = req.body.skillsRequired ?? job.skillsRequired;
  job.location = req.body.location ?? job.location;
  job.workersNeeded = req.body.workersNeeded ?? job.workersNeeded;

  await job.save();
  res.send(job);
});

// Customer deletes a job
router.delete("/:id", auth, customer, async (req, res) => {
  const job = await Jobs.findById(req.params.id);
  if (!job) return res.status(404).send("Job not found");
  if (job.customer.toString() !== req.user._id.toString())
    return res.status(403).send("Access denied");

  await job.deleteOne();
  res.send({ message: "Job deleted successfully" });
});

// Worker browses jobs matching skills with pagination
router.get("/", auth, worker, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const workerProfile = await Workers.findOne({ user: req.user._id });
  if (!workerProfile) return res.status(404).send("Worker profile not found");

  const jobs = await Jobs.find({
    status: JOB_STATUS.OPEN,
    skillsRequired: { $in: workerProfile.skills.map((s) => s.skill) },
  })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.send(jobs);
});

// Worker applies to a job
router.post("/:jobId/apply", auth, worker, async (req, res) => {
  const job = await Jobs.findById(req.params.jobId);
  if (!job) return res.status(404).send("Job not found");
  if (job.status !== JOB_STATUS.OPEN)
    return res.status(400).send("Job not open for applications");

  const existing = await Applications.findOne({
    job: job._id,
    worker: req.user._id,
  });
  if (existing) return res.status(400).send("Already applied");
  if (!req.body.proposedPrice || req.body.proposedPrice <= 0)
    return res.status(400).send("Invalid proposed price");

  const application = new Applications({
    job: job._id,
    worker: req.user._id,
    customer: job.customer,
    proposedPrice: req.body.proposedPrice,
  });
  await application.save();
  res.send({ message: "Applied successfully", application });
});

// Worker cancels application
router.post("/:jobId/cancel", auth, worker, async (req, res) => {
  const application = await Applications.findOne({
    job: req.params.jobId,
    worker: req.user._id,
    status: { $in: ["pending", "selected", "countered", "accepted"] },
  });

  if (!application) return res.status(404).send("No active application");

  const job = await Jobs.findById(req.params.jobId);
  if (job.status === JOB_STATUS.IN_PROGRESS)
    return res.status(400).send("Cannot cancel after job started");

  application.status = "cancelled";
  await application.save();

  job.assignedWorkers = job.assignedWorkers.filter(
    (w) => w.worker.toString() !== req.user._id.toString()
  );
  if (job.assignedWorkers.length < job.workersNeeded)
    job.status = JOB_STATUS.OPEN;

  await job.save();
  res.send({ message: "Application cancelled successfully" });
});

// Customer views applicants with ranking
router.get("/:jobId/applicants", auth, customer, async (req, res) => {
  const job = await Jobs.findById(req.params.jobId);
  if (!job) return res.status(404).send("Job not found");
  if (job.customer.toString() !== req.user._id)
    return res.status(403).send("Access Denied");

  const applicants = await Applications.find({ job: job._id }).populate(
    "worker"
  );
  const ranked = applicants.map((app) => {
    const wp = app.worker;
    let skillScore = wp.skills.reduce(
      (sum, s) =>
        job.skillsRequired.includes(s.skill.toString())
          ? sum + s.level * 2
          : sum,
      0
    );
    return {
      application: app,
      score: skillScore + wp.rating,
    };
  });
  ranked.sort((a, b) => b.score - a.score);
  res.send(ranked);
});

//Customer selects worker
router.put(
  "/:jobId/applicants/:appId/select",
  auth,
  customer,
  async (req, res) => {
    const { counterPrice } = req.body; // optional

    const job = await Jobs.findById(req.params.jobId);
    if (!job) return res.status(404).send("Job not found");

    if (job.customer.toString() !== req.user._id.toString())
      return res.status(403).send("Access denied");

    if (job.status !== JOB_STATUS.OPEN)
      return res.status(400).send("Job not open");

    const application = await Applications.findById(req.params.appId);
    if (!application) return res.status(404).send("Application not found");

    application.status = "selected";
    application.finalPrice = counterPrice ?? application.proposedPrice;

    await application.save();

    job.status = JOB_STATUS.AWAITING_CONFIRMATION;
    await job.save();

    res.send({
      message: counterPrice
        ? "Worker selected with counter offer"
        : "Worker selected at proposed price",
      application,
    });
  }
);

// Worker confirms the assignment

router.put("/applications/:appId/confirm", auth, worker, async (req, res) => {
  const application = await Applications.findById(req.params.appId);
  if (!application) return res.status(404).send("Application not found");

  if (application.worker.toString() !== req.user._id.toString())
    return res.status(403).send("Access denied");

  if (application.status !== "selected")
    return res.status(400).send("Job not selected yet");

  const job = await Jobs.findById(application.job);

  application.status = "confirmed";
  await application.save();

  job.assignedWorkers.push({
    worker: application.worker,
    agreedPrice: application.finalPrice,
  });

  if (job.assignedWorkers.length === job.workersNeeded) {
    job.status = JOB_STATUS.ASSIGNED;

    await Applications.updateMany(
      { job: job._id, _id: { $ne: application._id } },
      { status: "rejected" }
    );
  }

  await job.save();
  res.send({ message: "Job confirmed successfully" });
});

//Job Progress

router.put("/:jobId/start", auth, worker, async (req, res) => {
  const job = await Jobs.findById(req.params.jobId);
  if (!job) return res.status(404).send("Job not found");
  if (!job.assignedWorkers.some((w) => w.worker.toString() === req.user._id))
    return res.status(403).send("Not assigned to this job");

  job.status = JOB_STATUS.IN_PROGRESS;
  await job.save();
  res.send({ message: "Job started" });
});

//Completion of job
router.put("/:jobId/complete", auth, customer, async (req, res) => {
  const job = await Jobs.findById(req.params.jobId);
  if (!job) return res.status(404).send("Job not found");
  if (job.customer.toString() !== req.user._id)
    return res.status(403).send("Access denied");

  job.status = JOB_STATUS.COMPLETED;
  await job.save();
  res.send({ message: "Job marked as completed" });
});

// Customer reviews and rates the worker

router.post("/:jobId/review", auth, customer, async (req, res) => {
  const { rating, comment } = req.body;
  const job = await Jobs.findById(req.params.jobId);
  if (!job) return res.status(404).send("Job not found");
  if (job.status !== JOB_STATUS.COMPLETED)
    return res.status(400).send("Job not completed yet");

  for (const assignedWorker of job.assignedWorkers) {
    const existingReview = await Reviews.findOne({
      job: job._id,
      worker: assignedWorker.worker,
    });
    if (existingReview) continue;

    const review = new Reviews({
      job: job._id,
      customer: req.user._id,
      worker: assignedWorker.worker,
      rating,
      comment,
    });
    await review.save();

    const workerProfile = await Workers.findOne({
      user: assignedWorker.worker,
    });
    workerProfile.rating =
      (workerProfile.rating * workerProfile.totalReviews + rating) /
      (workerProfile.totalReviews + 1);
    workerProfile.totalReviews += 1;
    await workerProfile.save();
  }

  res.send({ message: "Review(s) submitted successfully" });
});

export default router;
