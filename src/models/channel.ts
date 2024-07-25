import { DataTypes, Model } from 'sequelize';

export class Channel extends Model {
  declare channelId: string;

  declare mods: string;
}

Channel.init(
  {
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mods: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  },
  {
    sequelize: Database,
  }
);
