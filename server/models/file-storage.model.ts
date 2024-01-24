import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

export class FileStorage extends Model<
  InferCreationAttributes<FileStorage>,
  InferAttributes<FileStorage>
> {
  declare fileId: CreationOptional<number>;
  declare path: string;
  declare name: string;
}

export const init = sequelize =>
  FileStorage.init(
    {
      fileId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      path: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
    },
    { modelName: "FileStorage", freezeTableName: true, sequelize }
  );
