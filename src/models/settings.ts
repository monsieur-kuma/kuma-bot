import { DEFAULT_SETTINGS } from 'configs';
import { DataTypes, Model } from 'sequelize';

import { Channel } from './channel';

export class Settings extends Model {
  declare guildId: string;

  declare adminRole: string;

  declare logChannel: string;

  declare systemNotice: boolean;

  declare commandReply: boolean;
}

Settings.init(
  {
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    adminRole: {
      type: DataTypes.STRING,
      defaultValue: DEFAULT_SETTINGS.adminRole,
    },
    logChannel: {
      type: DataTypes.STRING,
      defaultValue: DEFAULT_SETTINGS.logChannel,
    },
    systemNotice: {
      type: DataTypes.BOOLEAN,
      defaultValue: DEFAULT_SETTINGS.systemNotice,
    },
    commandReply: {
      type: DataTypes.BOOLEAN,
      defaultValue: DEFAULT_SETTINGS.commandReply,
    },
  },
  {
    sequelize: Database,
  }
);

Settings.hasMany(Channel, {
  foreignKey: 'guildId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
