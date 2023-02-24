import { HttpModuleOptions, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transaction } from './transaction/entities/transaction.entity';
import databaseConfig from './config/database.config';
import loggerConfig from './config/logger.config';
import httpConfig from './config/http.config';
import mvolaConfig from './config/mvola.config';
import stripeConfig from './config/stripe.config';
import { WinstonModule } from 'nest-winston';
import jwtConfig from './config/jwt.config';
import { HttpModule } from '@nestjs/axios';
import { ConnectionOptions } from 'typeorm';
import { HealthModule } from './health/health.module';
import { TransactionsModule } from './transaction/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, loggerConfig, httpConfig, jwtConfig, mvolaConfig,stripeConfig],
    }),
    WinstonModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('logger'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get<ConnectionOptions>('database'),
        entities: [Transaction],
      }),
      inject: [ConfigService],
    }),

    HttpModule.registerAsync({
      useFactory: async (configService: ConfigService) =>
        configService.get<HttpModuleOptions>('http'),
      inject: [ConfigService],
    }),
    TransactionsModule,
    HealthModule,
  ],
})
export class AppModule {}
