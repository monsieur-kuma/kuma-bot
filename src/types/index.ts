import type { ApplicationCommandData, Client, CommandInteraction, Message } from 'discord.js';
import type { Settings } from 'models';

export type SlashCmd = {
  conf: {
    permLevel: 'User' | 'Bot Admin' | 'Server Owner' | 'Administrator' | 'Bot Owner';
    guildOnly: boolean;
  };
  data: ApplicationCommandData & { defaultPermission: boolean };
  run: (
    client: Client,
    interaction: CommandInteraction,
    options: { settings?: Settings | null }
  ) => Promise<void>;
};

export type Command = {
  conf: {
    enabled: boolean;
    guildOnly: boolean;
    aliases: string[];
    permLevel: 'User' | 'Bot Admin' | 'Server Owner' | 'Administrator' | 'Bot Owner';
  };
  help: {
    name: string;
    category: string;
    description: string;
    usage: string;
  };
  run: (
    client: Client,
    message: Message,
    args: string[],
    level: number,
    options: { settings?: Settings | null; flags?: string[] }
  ) => Promise<void>;
};
