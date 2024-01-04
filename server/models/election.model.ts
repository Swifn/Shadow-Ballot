import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { Society } from "./society.model.js";
import { ElectionCandidates } from "./electrion-candidate.model.js";

export class Election extends Model<
  InferAttributes<Election>,
  InferCreationAttributes<Election>
> {
  declare electionId: CreationOptional<number>;

  declare name: string;
  declare readonly societyId: ForeignKey<Society["societyId"]>;

  declare candidateId: ForeignKey<ElectionCandidates["candidateId"]>;
  declare description: string;
  declare time: CreationOptional<Date>;
}

export const init = sequelize =>
  Election.init(
    {
      electionId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      societyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    { modelName: "Election", freezeTableName: true, sequelize }
  );
