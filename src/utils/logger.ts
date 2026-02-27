import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: isDevelopment
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),
  ],
});

// Security event logger
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export const logSecurityEvent = (event: {
  type: 'AUTH_FAILURE' | 'ACCESS_DENIED' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'INVALID_INPUT';
  userId?: string;
  ip: string;
  path: string;
  details?: any;
}) => {
  securityLogger.warn('Security event', {
    ...event,
    timestamp: new Date().toISOString(),
  });
};
