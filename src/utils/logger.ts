
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

const createLogger = (): Logger => {
  const isDevelopment = import.meta.env.DEV;
  
  const log = (level: LogLevel, message: string, ...args: any[]) => {
    // Only log in development mode
    if (!isDevelopment) return;
    
    // Filter out sensitive data
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        const sanitized = { ...arg };
        // Remove sensitive fields
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.email;
        delete sanitized.phone;
        return sanitized;
      }
      return arg;
    });
    
    switch (level) {
      case 'debug':
        console.debug(`[DEBUG] ${message}`, ...sanitizedArgs);
        break;
      case 'info':
        console.info(`[INFO] ${message}`, ...sanitizedArgs);
        break;
      case 'warn':
        console.warn(`[WARN] ${message}`, ...sanitizedArgs);
        break;
      case 'error':
        console.error(`[ERROR] ${message}`, ...sanitizedArgs);
        break;
    }
  };

  return {
    debug: (message: string, ...args: any[]) => log('debug', message, ...args),
    info: (message: string, ...args: any[]) => log('info', message, ...args),
    warn: (message: string, ...args: any[]) => log('warn', message, ...args),
    error: (message: string, ...args: any[]) => log('error', message, ...args),
  };
};

export const logger = createLogger();
