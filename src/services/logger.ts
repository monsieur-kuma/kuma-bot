import winston, { Logger } from 'winston';

export default (): Logger => {
  const logger = winston.createLogger({
    level: 'info',
    levels: winston.config.npm.levels,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({
        stack: true,
      }),
      winston.format.splat(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: 'combined.log',
        level: 'info',
      }),
      new winston.transports.File({
        filename: 'errors.log',
        level: 'error',
      }),
    ],
    exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log' })],
  });

  if (process.env.NODE_ENV === 'development') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      })
    );
  }

  return logger;
};
