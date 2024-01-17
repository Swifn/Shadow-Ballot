import express from "express";
import bodyParser from "body-parser";
import { Config } from "./configs/config.js";
import { authRouter } from "./routes/auth.route.js";
import { electionRouter } from "./routes/election.route.js";
import { societyRouter } from "./routes/society.route.js";
import { voterRouter } from "./routes/voter.route.js";
import cors from "cors";
import { sequelize } from "./models/index.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/election", electionRouter);
app.use("/society", societyRouter);
app.use("/voter", voterRouter);

const server = app.listen(Config.PORT, async () => {
  await sequelize.sync();
  console.log(`App running in port ${Config.PORT}`);
});
