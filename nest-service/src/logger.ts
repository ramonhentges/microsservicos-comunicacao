import { Injectable } from '@nestjs/common';
import {
  Logger as LoggerOtel,
  logs,
  SeverityNumber,
} from '@opentelemetry/api-logs';
import { SERVICE_NAME } from './tracer';

@Injectable()
export class Logger {
  private logger: LoggerOtel;
  constructor() {
    this.logger = logs.getLogger(SERVICE_NAME);
  }

  debug(message: string) {
    this.logger.emit({
      severityNumber: SeverityNumber.DEBUG,
      severityText: 'DEBUG',
      body: message,
    });
  }

  info(message: string) {
    console.log({ message });

    this.logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: message,
    });
  }

  warn(message: string) {
    this.logger.emit({
      severityNumber: SeverityNumber.WARN,
      severityText: 'WARN',
      body: message,
    });
  }

  error(message: string) {
    this.logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: message,
    });
  }
}
