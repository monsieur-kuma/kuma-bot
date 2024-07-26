/* eslint-disable no-var,  vars-on-top */
import type { Collection } from 'discord.js';
import { Sequelize } from 'sequelize';
import type { Logger as LoggerType } from 'winston';

declare global {
  type CustomObject<Type> = {
    [key: string]: Type;
  };

  var Logger: LoggerType;
  var Database: Sequelize;
  var Container: {
    commands: Collection<string, Command>;
    slashcmds: Collection<string, SlashCmd>;
    aliases: Collection<string, string>;
  };
  var LevelCache: CustomObject<number>;
}

export {};
