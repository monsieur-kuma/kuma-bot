import { Client, CommandInteraction } from 'discord.js';
import type { SlashCmd } from 'types';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply();
  const reply = await interaction.editReply('Ping?');
  await interaction.editReply(
    `Poing! Latency is ${
      reply.createdTimestamp - interaction.createdTimestamp
    }ms. API Latency is ${Math.round(client.ws.ping)}ms.`
  );
};

export const data: SlashCmd['data'] = {
  name: 'ping',
  description: 'Pongs when pinged',
  options: [],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
