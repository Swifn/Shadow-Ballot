import { Sequelize } from "sequelize";
import pg from "pg";
import { DbConfig } from "../configs/db.config.js";
import { init as initVoter } from "./voter.model.js";
import { init as initElection } from "./election.model.js";
import { init as initElectionCandidates } from "./election-candidates.model.js";
import { init as initSociety } from "./society.model.js";
import { init as initVote } from "./vote.model.js";
import { init as initVoterSociety } from "./voter-society.model.js";
import { init as initFileStorage } from "./file-storage.model.js";

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
export const ElectionCandidates = initElectionCandidates(sequelize);
export const Society = initSociety(sequelize);
export const VoterSociety = initVoterSociety(sequelize);
export const FileStorage = initFileStorage(sequelize);

export const Vote = initVote(sequelize);
//tested
Voter.hasMany(VoterSociety, { foreignKey: "voterId" });
VoterSociety.belongsTo(Voter, { foreignKey: "voterId" });
Voter.hasMany(Vote, { foreignKey: "voterId" });
Vote.belongsTo(Voter, { foreignKey: "voterId" });
Society.hasMany(VoterSociety, { foreignKey: "societyId" });
VoterSociety.belongsTo(Society, { foreignKey: "societyId" });

FileStorage.hasOne(Society, {
  foreignKey: "societyPicture",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Society.belongsTo(FileStorage, { foreignKey: "societyPicture" });
FileStorage.hasOne(Election, {
  foreignKey: "electionPicture",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Election.belongsTo(FileStorage, { foreignKey: "electionPicture" });
FileStorage.hasOne(ElectionCandidates, {
  foreignKey: "candidatePicture",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
ElectionCandidates.belongsTo(FileStorage, { foreignKey: "candidatePicture" });

//untested
Election.hasMany(ElectionCandidates, { foreignKey: "electionId" });
ElectionCandidates.belongsTo(Election, { foreignKey: "electionId" });
Society.hasMany(Election, { foreignKey: "societyId" });
Election.belongsTo(Society, { foreignKey: "societyId" });

ElectionCandidates.hasMany(Vote, { foreignKey: "candidateId" });
Vote.belongsTo(ElectionCandidates, { foreignKey: "candidateId" });

Election.hasMany(Vote, { foreignKey: "electionId" });
Vote.belongsTo(Election, { foreignKey: "electionId" });
Voter.hasMany(Election, { foreignKey: "societyOwnerId" });
Election.belongsTo(Voter, { foreignKey: "societyOwnerId" });
Voter.hasMany(Society, { foreignKey: "societyOwnerId" });
Society.belongsTo(Voter, { foreignKey: "societyOwnerId" });
