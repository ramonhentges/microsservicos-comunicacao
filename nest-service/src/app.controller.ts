import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    throw new InternalServerErrorException({ code: 'error', message: 'error' });
    return this.appService.getHello();
  }
}
