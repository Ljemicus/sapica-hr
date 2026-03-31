type LogLevel = 'info' | 'warn' | 'error';

function formatContext(context?: Record<string, unknown>) {
  if (!context) return '';

  try {
    return ` ${JSON.stringify(context)}`;
  } catch {
    return ' [unserializable-context]';
  }
}

function log(level: LogLevel, scope: string, message: string, context?: Record<string, unknown>) {
  const line = `[${scope}] ${message}${formatContext(context)}`;

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const appLogger = {
  info(scope: string, message: string, context?: Record<string, unknown>) {
    log('info', scope, message, context);
  },
  warn(scope: string, message: string, context?: Record<string, unknown>) {
    log('warn', scope, message, context);
  },
  error(scope: string, message: string, context?: Record<string, unknown>) {
    log('error', scope, message, context);
  },
};
