import { EmbedBuilder, TextChannel } from 'discord.js';
import { RedeemCode } from 'models';
import moment from 'moment';
import type { Command } from 'types';
import { GAMES } from 'utils';
import { autoRedeemCode } from 'utils/redeem_code';

export const run: Command['run'] = async (client, message, args) => {
  const [game, code] = args;
  if (!game || !code) {
    await message.reply({
      content: 'Vui lòng nhập game và code',
    });
    return;
  }
  if (!['hsr', 'gi', 'zzz'].includes(game)) {
    await message.reply({
      content: 'Game không hợp lệ',
    });
    return;
  }

  const isExist = await RedeemCode.findOne({
    where: {
      code,
      game,
    },
  });

  if (isExist && isExist.autoReceived) {
    await message.reply({
      content: 'Code đã được nhận tự động',
    });
    return;
  }

  const success = await autoRedeemCode(game as 'hsr' | 'gi' | 'zzz', [code], client);
  if (success[code]?.success?.length) {
    if (!isExist) {
      RedeemCode.create({
        code,
        game,
        autoReceived: true,
        discovered: moment().valueOf(),
        valid: 0,
        items: [],
      });
    } else {
      isExist.autoReceived = true;
      await isExist.save();
    }

    const gameInfo = GAMES[game as keyof typeof GAMES];
    const channel = await client.channels.fetch(gameInfo.channelNotify);
    if (channel) {
      const embedRedeemCode = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${gameInfo.name}`)
        .setDescription(`Tự động nhận code:`)
        .addFields([
          {
            name: code,
            value: `- Thành công: ${success[code].success.length}\n- Thất bại: ${success[code].error.length}`,
          },
        ])
        .setTimestamp();

      const botOwner = await client.users.fetch(process.env.BOT_OWNER as string);
      await botOwner.send({ embeds: [embedRedeemCode] });
      await (channel as TextChannel).send({
        content: `Đã tự động nhận code: \`${code}\``,
      });
    }
  }
};

export const conf: Command['conf'] = {
  enabled: true,
  guildOnly: false,
  aliases: ['game', 'code'],
  permLevel: 'Bot Owner',
};

export const help: Command['help'] = {
  name: 'code',
  category: 'Code',
  description: 'Thêm và nhận code tự động',
  usage: 'code <game> <code>',
};
