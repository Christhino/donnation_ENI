import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { MvolaService } from './payment-services/mvola/mvola.service';
import { MvolaController } from './payment-services/mvola/mvola.controller';
import { TestController } from './test.controller';
import { StripeService } from './payment-services/stripe/stripe.service';
import { StripeController } from './payment-services/stripe/stripe.controller';
const import_modules = [TypeOrmModule.forFeature([Transaction])];

@Module({
  imports: [...import_modules, HttpModule],
  providers: [TransactionsService, MvolaService,StripeService],
  controllers: [TransactionsController, MvolaController,StripeController],
  exports: import_modules,
})
export class TransactionsModule {}
