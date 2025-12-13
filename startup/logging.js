import winston from "winston";
import "winston-mongodb";

export default function () {
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  winston.add(
    new winston.transports.MongoDB({
      db: process.env.MONGO_URL,
      level: "error",
    })
  );
  winston.exceptions.handle(
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );
}
