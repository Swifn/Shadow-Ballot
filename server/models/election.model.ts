import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { Society } from "./society.model.js";
import { Voter } from "./voter.model.js";

export class Election extends Model<
  InferAttributes<Election>,
  InferCreationAttributes<Election>
> {
  declare electionId: CreationOptional<number>;

  declare name: string;
  declare societyId: ForeignKey<Society["societyId"]>;

  declare societyOwnerId: ForeignKey<Voter["voterId"]>;

  declare description: string;
  declare electionStatus: boolean;
  declare time: CreationOptional<Date>;
}

export const init = sequelize =>
  Election.init(
    {
      electionId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
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
      electionStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      societyOwnerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    { modelName: "Election", freezeTableName: true, sequelize }
  );
