import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

export class SocietySubject extends Model<
  InferAttributes<SocietySubject>,
  InferCreationAttributes<SocietySubject>
> {
  declare subjectId: CreationOptional<number>;
  declare name: string;
}

export const init = sequelize =>
  SocietySubject.init(
    {
      subjectId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { modelName: "SocietySubject", freezeTableName: true, sequelize }
  );
