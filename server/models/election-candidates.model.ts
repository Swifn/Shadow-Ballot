import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  ForeignKey,
  DataTypes,
  CreationOptional,
  BelongsToGetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { Election } from "./election.model.js";
import { FileStorage } from "./file-storage.model.js";

export class ElectionCandidates extends Model<
  InferAttributes<ElectionCandidates>,
  InferCreationAttributes<ElectionCandidates>
> {
  declare candidateId: CreationOptional<number>;
  declare electionId: ForeignKey<Election["electionId"]>;
  declare candidateName: string;

  declare candidateAlias: string;

  declare description: string;
  declare candidatePicture: ForeignKey<FileStorage["fileId"]>;
  declare getCandidatePicture: BelongsToGetAssociationMixin<FileStorage>;
  declare createCandidatePicture: BelongsToCreateAssociationMixin<FileStorage>;
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
      candidateName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      candidateAlias: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      candidatePicture: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
    },
    { modelName: "ElectionCandidates", freezeTableName: true, sequelize }
  );
