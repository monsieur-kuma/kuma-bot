import { DataTypes, Model } from 'sequelize';

import { Cookies } from './cookies';

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

AutoCheckin.hasMany(Cookies, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
