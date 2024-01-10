import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  Model,
} from "sequelize";

import { Voter } from "./voter.model.js";
import { ElectionCandidates } from "./election-candidates.model.js";
import { Election } from "./election.model.js";

export class Vote extends Model<
  InferAttributes<Vote>,
  InferCreationAttributes<Vote>
> {
  declare voteId: CreationOptional<number>;
  declare voterId: ForeignKey<Voter["voterId"]>;
  declare candidateId: ForeignKey<ElectionCandidates["candidateId"]>;
  declare electionId: ForeignKey<Election["electionId"]>;
}

export const init = sequelize =>
  Vote.init(
    {
      voteId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      voterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      electionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { modelName: "Vote", freezeTableName: true, sequelize }
  );
