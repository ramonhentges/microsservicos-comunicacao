import { initializeTracing } from './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  initializeTracing();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap();
