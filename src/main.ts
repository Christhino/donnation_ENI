import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`, `https: 'unsafe-inline'`,`http: 'unsafe-inline'`],
        //styleSrc: [`'self'`, `'unsafe-inline'`],
        //imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        //scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        //connectSrc: [],
      },
    } }));
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('Payment Service')
    .setDescription('The Payment Service')
    .setVersion('1.0.0')
    .setContact(
      'MINTSANIAINA Christhino',
      'https://www.linkedin.com/in/christhino/',
      'mintsaniaina.christhino@gmail.com',
    )
    /*.addBearerAuth({
      in: 'header',
      type: 'http',
    })
    .addBasicAuth({
      in: 'header',
      type: 'http',
    })*/
    .addOAuth2({
      type: 'oauth2',
      in: 'header',
      name: 'oauth2',
      //  openIdConnectUrl: ,
      flows: {
        clientCredentials: {
          tokenUrl: 'http://localhost:8082/realms/mgo/protocol/openid-connect/token',
          scopes: {}
        }
      }
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 8091);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
