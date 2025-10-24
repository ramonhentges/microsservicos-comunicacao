import { HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Logger } from './logger';

const EXTERNAL_CALL_URL = process.env.EXTERNAL_CALL_URL;
const EXTERNAL_CALL_METHOD = process.env.EXTERNAL_CALL_METHOD?.toLowerCase();
const RESPONSE_TIME = +(process.env.RESPONSE_TIME ?? 1000);
@Injectable()
export class AppService {
  constructor(private readonly logger: Logger) {}

  async getHello(): Promise<string> {
    this.logger.info('Waiting timeout');
    await new Promise((res) =>
      setTimeout(() => {
        res('resolved');
      }, RESPONSE_TIME),
    );

    if (!EXTERNAL_CALL_URL) return 'Hello World!';

    const isMethodAllowed = ['get', 'post'].includes(EXTERNAL_CALL_METHOD);
    if (!isMethodAllowed) {
      this.logger.error('Method not allowed');
      throw new Error('Method not allowed');
    }

    this.logger.info('Requesting data for other service');
    const response = await axios({
      method: EXTERNAL_CALL_METHOD,
      url: EXTERNAL_CALL_URL,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (response.status !== HttpStatus.OK) {
      this.logger.error('Error fetching data');
      throw new Error('Error fetching data');
    }
    return 'Hello World!' + response.data;
  }
}
