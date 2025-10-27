import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from './logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Example } from './example.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'admin',
      password: 'password',
      database: 'db',
      entities: [Example],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Example]),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
