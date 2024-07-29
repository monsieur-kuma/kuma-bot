import { Client, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';
import { checkInGame } from 'utils/common';

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply();
  const userCookies = await Cookies.findAll({ where: { userId: interaction.user.id } });
  if (!userCookies.length) {
    await interaction.editReply('No linked Hoyolab account found');
    return;
  }
  const results: { name: string; value: string }[] = [];
  await Promise.all(
    userCookies.map(async (userCookie) => {
      const { gameInfo, cookie } = userCookie;
      await Promise.all(
        Object.entries(gameInfo).map(async ([gameId, info]) => {
          const status = await checkInGame(cookie, gameId, info);
          results.push({
            name: GAMES[gameId as keyof typeof GAMES].name,
            value: status?.status || 'Failed',
          });
        })
      );
    })
  );

  const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle('Check in status')
    .addFields(results)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
};

export const data: SlashCmd['data'] = {
  name: 'checkin_games',
  description: 'Check in all games you have linked',
  options: [],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
