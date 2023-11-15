import { Sequelize } from "sequelize";
import { init as initVoter } from "./voter.model.js";

let db: Sequelize;

db = new Sequelize({
  dialect: "sqlite",
  storage: "dev.db",
  logging: false,
});

export const sequelize = db;

export const Voter = initVoter(sequelize);
