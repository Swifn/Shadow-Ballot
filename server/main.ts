import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { Config } from "./configs/config.js";
import { authRouter } from "./routes/auth.route.js";
import { electionRouter } from "./routes/election.route.js";
import { societyRouter } from "./routes/society.route.js";
import { voterRouter } from "./routes/voter.route.js";
import { voteRouter } from "./routes/vote.route.js";
import { sequelize } from "./models/index.js";
import cors from "cors";
import { seed } from "./seeders/index.js";
import { SocietySubject } from "./models/index.js";

const app = express();
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/election", electionRouter);
app.use("/society", societyRouter);
app.use("/voter", voterRouter);
app.use("/vote", voteRouter);

app.get("/society-subject", SocietySubject);

const server = app.listen(Config.PORT, async () => {
  await sequelize.sync();
  const isSeeded = (await SocietySubject.count()) !== 0;
  if (!isSeeded) {
    await seed();
  }
  console.log(`App running in port ${Config.PORT}`);
});
