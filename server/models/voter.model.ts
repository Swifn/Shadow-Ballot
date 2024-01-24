import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ForeignKey,
  CreationOptional,
} from "sequelize";
import { Config } from "../configs/config.js";
import { Society } from "./society.model.js";

export class Voter extends Model<
  InferAttributes<Voter>,
  InferCreationAttributes<Voter>
> {
  declare voterId: CreationOptional<number>;
  declare email: string;
  declare password: string;
  declare admin: CreationOptional<boolean>;
  //declare society: ForeignKey<Society["societyId"]>;
}
export const init = sequelize =>
  Voter.init(
    {
      voterId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    },
    { modelName: "Voter", freezeTableName: true, sequelize }
  );
