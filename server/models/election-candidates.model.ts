import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  ForeignKey,
  DataTypes,
  CreationOptional,
} from "sequelize";
import { Voter } from "./voter.model.js";
import { Election } from "./election.model.js";

export class ElectionCandidates extends Model<
  InferAttributes<ElectionCandidates>,
  InferCreationAttributes<ElectionCandidates>
> {
  declare candidateId: CreationOptional<number>;
  declare electionId: ForeignKey<Election["electionId"]>;
  declare voterId: ForeignKey<Voter["voterId"]>;
  declare candidateName: string;

  declare description: string;
}

export const init = sequelize =>
  ElectionCandidates.init(
    {
      candidateId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      electionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      voterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      candidateName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { modelName: "ElectionCandidates", freezeTableName: true, sequelize }
  );
