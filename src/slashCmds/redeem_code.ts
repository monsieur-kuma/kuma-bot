import { ChatInputCommandInteraction, Client, CommandInteraction, EmbedBuilder } from 'discord.js';
import {
  GenshinImpact,
  HonkaiStarRail,
  IRedeemCode,
  LanguageEnum,
  ZenlessZoneZero,
} from 'michos_api';
import { Cookies } from 'models';
import type { SlashCmd } from 'types';
import { GAMES } from 'utils';

type RedeemInfo = {
  game: string;
  code: string;
  cookie: string;
  gameInfo: { uid: number; server: string };
};

const redeemCode = async (info: RedeemInfo): Promise<IRedeemCode | null> => {
  const { game, code, cookie, gameInfo } = info;
  switch (game) {
    case 'gi': {
      const gi = new GenshinImpact({
        cookie: JSON.parse(cookie),
        uid: gameInfo.uid,
        lang: LanguageEnum.VIETNAMESE,
      });
      const result = await gi.redeem.claim(code);
      return result;
    }
    case 'hsr': {
      const hsr = new HonkaiStarRail({
        cookie: JSON.parse(cookie),
        uid: gameInfo.uid,
        lang: LanguageEnum.VIETNAMESE,
      });
      const result = await hsr.redeem.claim(code);
      return result;
    }
    case 'zzz': {
      const zzz = new ZenlessZoneZero({
        cookie: JSON.parse(cookie),
        uid: gameInfo.uid,
        lang: LanguageEnum.VIETNAMESE,
      });
      const result = await zzz.redeem.claim(code);
      return result;
    }
    default: {
      return null;
    }
  }
};

export const run: SlashCmd['run'] = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });
  const game = (interaction as ChatInputCommandInteraction).options.getString('game', true);
  const code = (interaction as ChatInputCommandInteraction).options.getString('code', true);
  const userGameInfo = await Cookies.findAll({
    where: {
      userId: interaction.user.id,
    },
  });

  if (!userGameInfo.length) {
    await interaction.editReply('Bạn chưa liên kết tài khoản Hoyolab nào');
    return;
  }

  const linkedGame = userGameInfo.filter((info) => info.gameInfo[game]);
  if (!linkedGame.length) {
    await interaction.editReply('Bạn chưa liên kết trò chơi này');
    return;
  }

  const results: { name: string; value: string }[] = [];

  await Promise.all(
    linkedGame.map(async (info) => {
      const { gameInfo, cookie } = info;
      const result = await redeemCode({ game, code, cookie, gameInfo: gameInfo[game] });
      if (result) {
        results.push({
          name: `${gameInfo[game].name} - UID: ${gameInfo[game].uid}`,
          value: result.message === 'OK' ? (result.data as any).msg : result.message,
        });
      }
    })
  );

  const gameInfo = GAMES[game as keyof typeof GAMES];
  const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle(`${gameInfo.icon} ${gameInfo.name}`)
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setDescription(`**Mã đỗi**: ${code}`)
    .addFields(results)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
};

export const data: SlashCmd['data'] = {
  name: 'redeem_code',
  description: 'Nhận code cho các trò chơi Hoyolab',
  options: [
    {
      name: 'game',
      type: 3,
      required: true,
      description: 'Chọn trò chơi bạn muốn nhận code',
      choices: [
        {
          name: 'Genshin Impact',
          value: 'gi',
        },
        {
          name: 'Honkai Star Rail',
          value: 'hsr',
        },
        {
          name: 'Zenless Zone Zero',
          value: 'zzz',
        },
      ],
    },
    {
      name: 'code',
      type: 3,
      required: true,
      description: 'Mã code bạn muốn nhận',
    },
  ],
  defaultPermission: true,
};

export const conf: SlashCmd['conf'] = {
  permLevel: 'User',
  guildOnly: false,
};
