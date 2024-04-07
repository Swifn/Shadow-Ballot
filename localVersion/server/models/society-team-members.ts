import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  Model,
  BelongsToGetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";

import { Society } from "./society.model.js";
import { FileStorage } from "./file-storage.model.js";

export class SocietyTeamMembers extends Model<
  InferAttributes<SocietyTeamMembers>,
  InferCreationAttributes<SocietyTeamMembers>
> {
  declare memberId: CreationOptional<number>;
  declare name: string;
  declare alias: string;
  declare role: string;
  declare societyId: ForeignKey<Society["societyId"]>;
  declare memberPicture: ForeignKey<FileStorage["fileId"]>;

  declare getMemberPicture: BelongsToGetAssociationMixin<FileStorage>;
  declare createMemberPicture: BelongsToCreateAssociationMixin<FileStorage>;
}

export const init = sequelize =>
  SocietyTeamMembers.init(
    {
      memberId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alias: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      societyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      memberPicture: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    { modelName: "SocietyTeamMembers", freezeTableName: true, sequelize }
  );
