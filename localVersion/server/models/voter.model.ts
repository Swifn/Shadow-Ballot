import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";

export class Voter extends Model<
  InferAttributes<Voter>,
  InferCreationAttributes<Voter>
> {
  declare voterId: CreationOptional<number>;
  declare email: string;
  declare password: string;
  declare admin: CreationOptional<boolean>;
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
