import { sequelize, SocietySubject } from "../models/index.js";
import SOCIETY_SUBJECTS from "./society-subject.json" assert { type: "json" };

export const seed = async () => {
  await sequelize.sync({ force: true });
  await Promise.all([SocietySubject.bulkCreate(SOCIETY_SUBJECTS)]);
};
