/**
 * 로깅 유틸리티
 * 개발/프로덕션 환경에 따른 로깅 관리
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: unknown;
}

class Logger {
  private isDev = import.meta.env.DEV;

  private log(level: LogLevel, message: string, meta?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, meta || '');
        // 프로덕션에서는 Sentry 등으로 전송
        // if (!this.isDev) {
        //   Sentry.captureMessage(message, { level: 'error', extra: meta });
        // }
        break;
      case 'warn':
        console.warn(logMessage, meta || '');
        break;
      case 'debug':
        if (this.isDev) {
          console.debug(logMessage, meta || '');
        }
        break;
      case 'info':
      default:
        console.log(logMessage, meta || '');
        break;
    }
  }

  info(message: string, meta?: LogMetadata) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: LogMetadata) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: LogMetadata) {
    const errorMeta = {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : undefined
    };
    this.log('error', message, errorMeta);
  }

  debug(message: string, meta?: LogMetadata) {
    this.log('debug', message, meta);
  }

  /**
   * 사용자 행동 추적
   * Google Analytics, Mixpanel 등으로 전송
   */
  track(event: string, properties?: LogMetadata) {
    if (this.isDev) {
      console.log(`[TRACK] ${event}`, properties);
    }
    // 실제 환경에서는 분석 도구로 전송
    // analytics.track(event, properties);
  }
}

export const logger = new Logger();
