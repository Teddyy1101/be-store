import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const config = new DocumentBuilder()
    .setTitle('API - Web bán điện thoại')
    .setDescription('Tài liệu API cho hệ thống giao hàng và quản lý đơn hàng')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
  console.log(`📘 Swagger Docs: http://localhost:${port}/api-docs`);
}
bootstrap();
