import { DataTypes, Model } from 'sequelize';

type GameInfo = CustomObject<{
  uid: number;
  server: string;
  name: string;
}>;

export class Cookies extends Model {
  declare userId: string;

  declare cookie: string;

  declare gameInfo: GameInfo;

  declare gi: boolean;

  declare hsr: boolean;

  declare zzz: boolean;

  declare hi3: boolean;
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
    gi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hsr: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    zzz: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hi3: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: Database,
  }
);
