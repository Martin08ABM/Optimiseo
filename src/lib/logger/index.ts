import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    error: pino.stdSerializers.err,
  },
  redact: {
    paths: [
      '*.password',
      '*.token',
      '*.apiKey',
      '*.secret',
      '*.credentials',
      '*.auth',
      '*.user.email',
      '*.user.id',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
});

// Child loggers for specific domains
export const analysisLogger = logger.child({ domain: 'analysis' });
export const authLogger = logger.child({ domain: 'auth' });
export const paymentLogger = logger.child({ domain: 'payment' });
export const webhookLogger = logger.child({ domain: 'webhook' });
export const cacheLogger = logger.child({ domain: 'cache' });
export const securityLogger = logger.child({ domain: 'security' });

export default logger;