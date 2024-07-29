import { DataTypes, Model } from 'sequelize';

export class AutoCheckin extends Model {
  declare userId: string;
}

AutoCheckin.init(
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: Database,
  }
);
