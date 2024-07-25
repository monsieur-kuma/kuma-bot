import { TextChannel } from 'discord.js';
import type { Command } from 'types';

export const run: Command['run'] = async (client, message) => {
  (message.channel as TextChannel).send('Config');
  //   if (!message.guild) {
  //     return;
  //   }

  //   // Retrieve current guild settings (merged) and overrides only.
  //   let settings = await Settings.findOne({ where: { guildId: message.guildId } });
  //   if (!settings) {
  //     settings = await Settings.create({ guildId: message.guildId });
  //   }

  //   if (settings) {
  //     // User must specify a key.
  //     if (!key) {
  //       message.reply({
  //         content: 'Please specify a key to edit',
  //         allowedMentions: { repliedUser: settings.commandReply },
  //       });
  //       return;
  //     }
  //     // User must specify a key that actually exists!
  //     if (_.get(settings, key) === undefined) {
  //       message.reply({
  //         content: 'This key does not exist in the settings',
  //         allowedMentions: { repliedUser: settings.commandReply },
  //       });
  //       return;
  //     }
  //     const joinedValue = value.join(' ');
  //     if (action === 'edit') {
  //       // User must specify a value to change.
  //       if (joinedValue.length < 1) {
  //         message.reply({
  //           content: 'Please specify a new value',
  //           allowedMentions: { repliedUser: settings.commandReply },
  //         });
  //         return;
  //       }
  //       // User must specify a different value than the current one.
  //       if (joinedValue === _.get(settings, key)) {
  //         message.reply({
  //           content: 'This setting already has that value!',
  //           allowedMentions: { repliedUser: settings.commandReply },
  //         });
  //         return;
  //       }

  //       _.set(settings, key, joinedValue);
  //       await settings.save();

  //       // Confirm everything is fine!
  //       message.reply({
  //         content: `${key} successfully edited to ${joinedValue}`,
  //         allowedMentions: { repliedUser: settings.commandReply },
  //       });
  //     } else if (action === 'reset') {
  //       const response = await awaitReply(
  //         message,
  //         `Are you sure you want to reset ${key} to the default value?`
  //       );

  //       // If they respond with y or yes, continue.
  //       if (['y', 'yes'].includes(response.toLowerCase())) {
  //         // We delete the `key` here.
  //         _.set(settings, key, _.get(DEFAULT_SETTINGS, key));
  //         await settings.save();
  //         message.reply({
  //           content: `${key} was successfully reset to default.`,
  //           allowedMentions: { repliedUser: settings.commandReply },
  //         });
  //       }
  //       // If they respond with n or no, we inform them that the action has been cancelled.
  //       else if (['n', 'no', 'cancel'].includes(response)) {
  //         message.reply({
  //           content: `Your setting for \`${key}\` remains at \`${_.get(settings, key)}\``,
  //           allowedMentions: { repliedUser: settings.commandReply },
  //         });
  //       }
  //     } else if (action === 'get') {
  //       const isDefault =
  //         _.get(settings, key) === _.get(DEFAULT_SETTINGS, key)
  //           ? '\nThis is the default global default value.'
  //           : '';
  //       message.reply({
  //         content: `The value of ${key} is currently ${_.get(settings, key)}${isDefault}`,
  //         allowedMentions: { repliedUser: settings.commandReply },
  //       });
  //     } else {
  //       // Otherwise, the default action is to return the whole configuration;
  //       const array: string[] = [];
  //       Object.entries(settings).forEach(([field, val]) => {
  //         array.push(`${field}${' '.repeat(20 - field.length)}::  ${val}`);
  //       });
  //       await (message.channel as TextChannel).send(
  //         codeBlock(
  //           'asciidoc',
  //           `= Current Guild Settings =
  // ${array.join('\n')}`
  //         )
  //       );
  //     }
  //   }
};

export const conf: Command['conf'] = {
  enabled: true,
  guildOnly: true,
  aliases: ['setting', 'settings', 'conf'],
  permLevel: 'Administrator',
};

export const help: Command['help'] = {
  name: 'conf',
  category: 'System',
  description: 'View or change settings for your server.',
  usage: 'conf <view/get/edit/reset> <key> <value>',
};
