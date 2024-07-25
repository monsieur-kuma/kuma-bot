import async from 'async';
import { BaseInteraction, GuildMemberRoleManager, Message } from 'discord.js';
import { Settings } from 'models';

const getUser = (message: Message | BaseInteraction) =>
  (message as Message).author ?? (message as BaseInteraction).user ?? {};

export const PERM_LEVELS: {
  level: number;
  name: string;
  check: (message: Message | BaseInteraction) => Promise<boolean>;
  guildOnly?: boolean;
}[] = [
  // Lowest permission level, for users without a role.
  {
    level: 0,
    name: 'User',
    check: async () => true,
  },

  {
    level: 3,
    name: 'Administrator',
    check: async (message) => {
      try {
        if (message.guild) {
          const settings = await Settings.findOne({
            where: { guildId: message.guild.id },
          });
          if (settings && message.member) {
            const adminRole = message.guild.roles.cache.find(
              (r) => r.name.toLowerCase() === settings.adminRole.toLowerCase()
            );
            if (adminRole) {
              return (message.member.roles as GuildMemberRoleManager).cache.has(adminRole.id);
            }
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    },
  },

  {
    level: 4,
    name: 'Server Owner',
    check: async (message) => message.guild?.ownerId === message.client.user.id,
  },

  // Has some limited access like rebooting the bot or reloading commands.
  {
    level: 9,
    name: 'Bot Admin',
    check: async () => false,
  },

  /*
   * Bot owner, should be the highest permission level available.
   * Allow to run dangerous commands such as eval or exec.
   */
  {
    level: 10,
    name: 'Bot Owner',
    check: async (message) => getUser(message).id === process.env.BOT_OWNER,
  },
];

const ORDERED_PERM = PERM_LEVELS.slice(0).sort((p, c) => (p.level < c.level ? 1 : -1));

// Generate a cache of client permissions for pretty perm names in commands.
global.LevelCache = {};
PERM_LEVELS.forEach(({ name, level }) => {
  LevelCache[name] = level;
});

// Get the highest permission level
export const permLevel = async (message: Message | BaseInteraction): Promise<number> => {
  const permlvl = await async.detectSeries(ORDERED_PERM, async (perm) => {
    if (!message.guild || !perm.guildOnly) {
      const pass = await perm.check(message);
      return pass;
    }
    return true;
  });

  return permlvl?.level ?? 0;
};

export const readPermLevel = (level: number) =>
  PERM_LEVELS.find((perm) => perm.level === level)?.name;
