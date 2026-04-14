type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface StructuredLogger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: unknown, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
}

const isProduction = process.env.NODE_ENV === 'production';

export function createLogger(moduleName: string): StructuredLogger {
  const formatMessage = (level: LogLevel, message: string, context?: LogContext, error?: unknown) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: moduleName,
      message,
      ...(context ? { context } : {}),
      ...(error !== undefined ? { error: error instanceof Error ? { message: error.message, stack: error.stack } : error } : {}),
    };

    return isProduction ? JSON.stringify(logEntry) : logEntry;
  };

  return {
    info: (message, context) => {
      const formatted = formatMessage('info', message, context);
      if (isProduction) {
        // eslint-disable-next-line no-console
        console.log(formatted);
      } else {
        // eslint-disable-next-line no-console
        console.log(`[INFO][${moduleName}] ${message}`, context || '');
      }
    },
    warn: (message, context) => {
      const formatted = formatMessage('warn', message, context);
      if (isProduction) {
        console.warn(formatted);
      } else {
        console.warn(`[WARN][${moduleName}] ${message}`, context || '');
      }
    },
    error: (message, error, context) => {
      const formatted = formatMessage('error', message, context, error);
      if (isProduction) {
        console.error(formatted);
      } else {
        console.error(`[ERROR][${moduleName}] ${message}`, error || '', context || '');
      }
    },
    debug: (message, context) => {
      if (!isProduction) {
        // eslint-disable-next-line no-console
        console.debug(`[DEBUG][${moduleName}] ${message}`, context || '');
      }
    },
  };
}
