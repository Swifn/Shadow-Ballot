import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

export class Society extends Model<
  InferCreationAttributes<Society>,
  InferAttributes<Society>
> {
  declare societyId: CreationOptional<number>;
  declare name: string;
}

export const innit = sequelize =>
  Society.init(
    {
      societyId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
    },
    { modelName: "Society", freezeTableName: true, sequelize }
  );
