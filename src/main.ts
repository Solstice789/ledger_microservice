import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.setGlobalPrefix('api');

  const swaggerConfig: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Ledger Service')
    .setDescription('Ledger Service APIs')
    .setVersion('1.0.0')
    .build();

  const documentFactory: OpenAPIObject = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );
  SwaggerModule.setup('swagger-ui.html', app, documentFactory);

  const port: string = process.env.PORT ?? '3000';
  await app.listen(port);

  console.log(`Service listening on port ${port}`);
}
bootstrap();
