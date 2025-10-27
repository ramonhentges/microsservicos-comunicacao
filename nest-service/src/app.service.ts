import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import axios from 'axios';
import { Logger } from './logger';
import { Example } from './example.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const EXTERNAL_CALL_URL = process.env.EXTERNAL_CALL_URL;
const EXTERNAL_CALL_METHOD = process.env.EXTERNAL_CALL_METHOD?.toLowerCase();
const RESPONSE_TIME = +(process.env.RESPONSE_TIME ?? 1000);
@Injectable()
export class AppService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  private html(content: string) {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Microservice</title>
    <style>
        body {
           background-color: ${process.env.BACKGROUND_COLOR};
        }
        h1 {
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>${process.env.TITLE}</h1>
    ${content}
</body>
</html>
`;
  }

  async getHello(): Promise<string> {
    this.logger.info('Waiting timeout');
    await new Promise((res) =>
      setTimeout(() => {
        res('resolved');
      }, RESPONSE_TIME),
    );

    if (!EXTERNAL_CALL_URL) return this.html('');

    const isMethodAllowed = ['get', 'post'].includes(EXTERNAL_CALL_METHOD);
    if (!isMethodAllowed) {
      this.logger.error('Method not allowed');
      throw new Error('Method not allowed');
    }

    const example = Example.create();

    const searchExample = await this.exampleRepository.findOne({
      where: { id: example.id },
    });

    if (searchExample) {
      this.logger.error('Example already exists');
      throw new UnprocessableEntityException('Example already exists');
    }

    await this.exampleRepository.insert(example);

    this.logger.info('Requesting data for other service');
    const response = await axios<string>({
      method: EXTERNAL_CALL_METHOD,
      url: EXTERNAL_CALL_URL,
    }).catch((error: Error) => {
      this.logger.error(error.stack);
      throw new Error('Error fetching data');
    });

    return this.html(response.data);
  }
}
