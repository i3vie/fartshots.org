import { Sequelize, DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db/i3vie.sqlite",
});

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare password: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "User",
  }
)

export async function initDB() {
  await sequelize.sync();
}