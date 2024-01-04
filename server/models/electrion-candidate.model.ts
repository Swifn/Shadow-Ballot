import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  ForeignKey,
  DataTypes,
} from "sequelize";
import { Voter } from "./voter.model.js";

export class ElectionCandidates extends Model<
  InferAttributes<ElectionCandidates>,
  InferCreationAttributes<ElectionCandidates>
> {
  declare readonly candidateId: ForeignKey<Voter["voterId"]>;

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
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { modelName: "ElectionCandidates", freezeTableName: true, sequelize }
  );
