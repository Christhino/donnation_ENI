import { registerAs } from '@nestjs/config';
import { LoggerOptions, transports } from 'winston';

export default registerAs('logger', (): LoggerOptions => {
  return {
    transports: [
      new transports.Console({
        level: 'debug',
        handleExceptions: true,
      }),

      new transports.File({
        filename: './logs/log.log',
      }),
    ],
    exitOnError: false,
  };
});
