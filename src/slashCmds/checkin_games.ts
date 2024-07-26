import { Client, CommandInteraction, EmbedBuilder } from 'discord.js';
import {
  GenshinImpact,
  HonkaiImpact,
  HonkaiStarRail,
  ICookie,
  IDailyClaim,
  LanguageEnum,
} from 'michos_api';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';

const checkInGame = async (
  cookie: string,
  game: string,
  info: { uid: number; server: string }
): Promise<IDailyClaim | null> => {
  const { uid } = info;
  switch (game) {
    case 'gi': {
      const genshin = new GenshinImpact({
        cookie: JSON.parse(cookie) as ICookie,
        uid,
        lang: LanguageEnum.ENGLISH,
      });
      const result = await genshin.daily.claim();
      return result;
    }
    case 'hi3': {
      const hi3 = new HonkaiImpact({
        cookie: JSON.parse(cookie) as ICookie,
        uid,
        lang: LanguageEnum.ENGLISH,
      });
      const result = await hi3.daily.claim();
      return result;
    }
    case 'hsr': {
      const hsr = new HonkaiStarRail({
        cookie: JSON.parse(cookie) as ICookie,
        uid,
        lang: LanguageEnum.ENGLISH,
      });
      const result = await hsr.daily.claim();
      return result;
    }
    default: {
      return null;
    }
  }
};

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
  description: 'Check in games for the day in hoyolab',
  options: [],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
