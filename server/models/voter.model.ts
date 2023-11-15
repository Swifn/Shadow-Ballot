import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ForeignKey,
} from "sequelize";
import { Config } from "../config/config";
import { Society } from "./society.model.js";

export class Voter extends Model<
  InferAttributes<Voter>,
  InferCreationAttributes<Voter>
> {
  declare voterId: string;
  declare email: string;
  declare password: string;
  declare admin: boolean;
  declare society: ForeignKey<Society["societyId"]>;
}
export const init = sequelize =>
  Voter.init(
    {
      voterId: {
        type: DataTypes.TEXT,
        primaryKey: true,
        unique: true,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
          is: {
            args: [Config.ORG_EMAIL_REGEX],
            msg: "Email must be university authenticated",
          },
        },
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      society: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
    },
    { modelName: "Voter", freezeTableName: true, sequelize }
  );
