export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.debug(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.info(message, ...args);
    }
  },
};
