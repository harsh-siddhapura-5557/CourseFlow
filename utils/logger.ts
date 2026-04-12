type LogPayload = Record<string, unknown> | undefined;

const format = (scope: string, message: string, payload?: LogPayload) => {
  if (payload && Object.keys(payload).length > 0) {
    return `[${scope}] ${message} ${JSON.stringify(payload)}`;
  }
  return `[${scope}] ${message}`;
};

/** Dev-focused structured logs; no-op in production for noise reduction */
export const logger = {
  info: (scope: string, message: string, payload?: LogPayload) => {
    if (__DEV__) console.info(format(scope, message, payload));
  },
  warn: (scope: string, message: string, payload?: LogPayload) => {
    if (__DEV__) console.warn(format(scope, message, payload));
  },
  error: (scope: string, message: string, payload?: LogPayload) => {
    console.error(format(scope, message, payload));
  },
};
