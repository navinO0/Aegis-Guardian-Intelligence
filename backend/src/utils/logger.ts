import pino from 'pino';
import pinoPretty from 'pino-pretty';

export const logger = pino(pinoPretty({ 
  colorize: true,
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname'
}));
