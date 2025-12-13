async function worker(req, res, next) {
  if (req.user.role != "worker")
    return res.status(403).send("Access denied- not a worker");
  next();
}
export default worker;
