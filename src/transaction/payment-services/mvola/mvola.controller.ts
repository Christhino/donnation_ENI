import { Controller, Inject, Put, Body } from '@nestjs/common';
import { TransactionsService } from 'src/transaction/transactions.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MvolaService } from './mvola.service';
import { PaymentMerchantCallback } from './types';
import { notifyTransaction } from 'src/transaction/notification-transaction';
import { HttpService } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('mvola')
export class MvolaController {
  constructor(
    private httpService: HttpService,
    private readonly mvolaService: MvolaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Put('/notify')
  @ApiExcludeEndpoint()
  async notification(@Body() body: PaymentMerchantCallback) {
    const transaction =
      await this.mvolaService.paymentMerchantTransactionCallback(body);

    notifyTransaction({
      logger: this.logger,
      httpService: this.httpService,
      transaction,
    });

    return { status: 'OK' };
  }
}
