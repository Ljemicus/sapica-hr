/**
 * Structured logger for PetPark — outputs JSON lines in production, readable lines in dev.
 * Severity levels align with the PetPark Monitoring & Alerting Spec (P0–P4).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type Severity = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  severity?: Severity;
  scope: string;
  message: string;
  context?: Record<string, unknown>;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function buildEntry(
  level: LogLevel,
  scope: string,
  message: string,
  context?: Record<string, unknown>,
  severity?: Severity,
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    ...(severity ? { severity } : {}),
    scope,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };
}

function emit(entry: LogEntry) {
  const output = IS_PRODUCTION
    ? JSON.stringify(entry)
    : `[${entry.level.toUpperCase()}] [${entry.scope}]${entry.severity ? ` (${entry.severity})` : ''} ${entry.message}${entry.context ? ' ' + JSON.stringify(entry.context) : ''}`;

  if (entry.level === 'fatal' || entry.level === 'error') {
    console.error(output);
  } else if (entry.level === 'warn') {
    console.warn(output);
  } else {
    console.info(output);
  }
}

export const appLogger = {
  debug(scope: string, message: string, context?: Record<string, unknown>) {
    if (IS_PRODUCTION) return;
    emit(buildEntry('debug', scope, message, context));
  },
  info(scope: string, message: string, context?: Record<string, unknown>) {
    emit(buildEntry('info', scope, message, context));
  },
  warn(scope: string, message: string, context?: Record<string, unknown>, severity?: Severity) {
    emit(buildEntry('warn', scope, message, context, severity ?? 'P3'));
  },
  error(scope: string, message: string, context?: Record<string, unknown>, severity?: Severity) {
    emit(buildEntry('error', scope, message, context, severity ?? 'P1'));
  },
  fatal(scope: string, message: string, context?: Record<string, unknown>) {
    emit(buildEntry('fatal', scope, message, context, 'P0'));
  },
  /** Raw structured entry for custom scenarios (e.g. alert dispatcher). */
  raw(entry: LogEntry) {
    emit(entry);
  },
};
