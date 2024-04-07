import {
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { Voter } from "./voter.model.js";
import { FileStorage } from "./file-storage.model.js";
import { SocietySubject } from "./society-subjects.model.js";

export class Society extends Model<
  InferCreationAttributes<Society>,
  InferAttributes<Society>
> {
  declare societyId: CreationOptional<number>;

  declare societyOwnerId: ForeignKey<Voter["voterId"]>;
  declare name: string;
  declare description: string;
  declare subjectId: ForeignKey<SocietySubject["subjectId"]>;
  declare societyPicture: ForeignKey<FileStorage["fileId"]>;

  declare getSocietyPicture: BelongsToGetAssociationMixin<FileStorage>;
  declare createSocietyPicture: BelongsToCreateAssociationMixin<FileStorage>;
}

export const init = sequelize =>
  Society.init(
    {
      societyId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      societyOwnerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      societyPicture: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    { modelName: "Society", freezeTableName: true, sequelize }
  );
