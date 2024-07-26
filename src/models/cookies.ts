import { DataTypes, Model } from 'sequelize';

type GameInfo = CustomObject<{
  uid: number;
  server: string;
}>;

export class Cookies extends Model {
  declare userId: string;

  declare cookie: string;

  declare gameInfo: GameInfo;
}

Cookies.init(
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cookie: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gameInfo: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('gameInfo');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: string[]) {
        this.setDataValue('gameInfo', JSON.stringify(value));
      },
    },
  },
  {
    sequelize: Database,
  }
);
