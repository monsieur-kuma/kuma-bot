import { DataTypes, Model } from 'sequelize';

export class RedeemCode extends Model {
  declare code: string;

  declare game: string;

  declare autoReceived: boolean;

  declare discovered: string;

  declare valid: string;

  declare items: string[];
}

RedeemCode.init(
  {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    game: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    autoReceived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    discovered: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    valid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('items');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: string[]) {
        this.setDataValue('items', JSON.stringify(value));
      },
    },
  },
  {
    sequelize: Database,
  }
);
