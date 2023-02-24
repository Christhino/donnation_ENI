import { Controller, Inject, Put, Body, Post } from '@nestjs/common';
import { TransactionsService } from 'src/transaction/transactions.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MvolaService } from './payment-services/mvola/mvola.service';
import { PaymentMerchantCallback } from './payment-services/mvola/types';
import { notifyTransaction } from 'src/transaction/notification-transaction';
import { HttpService } from '@nestjs/axios';
import { Transaction } from './entities/transaction.entity';

@Controller('test')
export class TestController {
  constructor(
    private httpService: HttpService,
    private readonly mvolaService: MvolaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post('/notify')
  async notification(@Body() body: Transaction) {
    this.logger.warn('[Test] body', body);

    return { status: 'OK' };
  }
}
