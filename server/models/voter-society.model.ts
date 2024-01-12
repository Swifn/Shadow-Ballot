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

export class VoterSociety extends Model<
  InferAttributes<VoterSociety>,
  InferCreationAttributes<VoterSociety>
> {
  declare voterSocietyId: CreationOptional<number>;
  declare societyId: ForeignKey<Society["societyId"]>;
  declare voterId: ForeignKey<Voter["voterId"]>;
}

export const init = sequelize =>
  VoterSociety.init(
    {
      voterSocietyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      societyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      voterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      modelName: "VoterSociety",
      freezeTableName: true,
      sequelize,
    }
  );
