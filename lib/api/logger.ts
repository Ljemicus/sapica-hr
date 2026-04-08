/**
 * Application logger
 */

import type { LogData } from './types';

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: string;
  data?: LogData;
}

export class Logger {
  private context: string;
  
  constructor(context: string = 'app') {
    this.context = context;
  }
  
  debug(message: string, data?: LogData): void {
    this.log('debug', message, data);
  }
  
  info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: LogData): void {
    this.log('error', message, data);
  }
  
  private log(level: LogEntry['level'], message: string, data?: LogData): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
    };
    
    // In production, this would send to a logging service
    // For now, just console.log with appropriate level
    const logMethod = level === 'error' ? console.error :
                     level === 'warn' ? console.warn :
                     level === 'info' ? console.info :
                     console.debug;
    
    logMethod(`[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}] ${message}`, data || '');
  }
  
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

// Default application logger
export const appLogger = new Logger('app');

// Create logger for specific module
export function createLogger(context: string): Logger {
  return new Logger(context);
}
