import { Sequelize } from "sequelize";
import pg from "pg";
import { DbConfig } from "../configs/db.config.js";
import { init as initVoter } from "./voter.model.js";
import { init as initElection } from "./election.model.js";
import { init as initElectionCandidate } from "./electrion-candidate.model.js";
import { init as initSociety } from "./society.model.js";
import { init as initVote } from "./vote.model.js";

let db: Sequelize;

if (process.env.NODE_ENV === "production") {
  if (!DbConfig.database || !DbConfig.user || !DbConfig.password) {
    throw new Error(
      "Production mode selected with database undefined: Set the database environment variables"
    );
  }
  db = new Sequelize(DbConfig.database, DbConfig.user, DbConfig.password, {
    host: DbConfig.host,
    port: DbConfig.port,
    dialect: "postgres",
    dialectModule: pg,
    logging: false,
  });
} else {
  db = new Sequelize({
    dialect: "sqlite",
    storage: "dev.db",
    logging: false,
  });
}

export const sequelize = db;

export const Voter = initVoter(sequelize);
export const Election = initElection(sequelize);
export const ElectionCandidate = initElectionCandidate(sequelize);
export const Society = initSociety(sequelize);

export const Vote = initVote(sequelize);
