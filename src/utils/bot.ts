import { Message, TextChannel } from 'discord.js';

/*
  A simple way to grab a single reply, from the user that initiated
  the command. Useful to get "precisions" on certain things...

  const response = await awaitReply(msg, "Favourite Color?");
  msg.reply(`Oh, I really love ${response} too!`);
*/
export const awaitReply = async (msg: Message, question: string, limit = 60000) => {
  const filter = (m: Message) => m.author.id === msg.author.id;
  await (msg.channel as TextChannel).send(question);
  try {
    const collected = await (msg.channel as TextChannel).awaitMessages({
      filter,
      max: 1,
      time: limit,
      errors: ['time'],
    });
    const replied = collected.first();
    return replied?.content ?? '';
  } catch (e) {
    return '';
  }
};
