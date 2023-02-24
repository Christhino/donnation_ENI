import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Query,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import {
  ApiOAuth2,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  BadRequestHttpException,
  ForbiddenHttpException,
  NotFoundHttpException,
} from 'src/common/dto/http-exception.dto';
import { UserGuard } from 'src/util/user-guard';
import { MvolaService } from './payment-services/mvola/mvola.service';
import { Payment } from 'src/transaction/dto/payment.dto';
import { TransactionsService } from 'src/transaction/transactions.service';
import { Transaction } from './dto/transaction.dto';
import { PaymentService } from './payment-services/PaymentService';
import { PaymentMethod } from './payment-services/PaymentMethod';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { launchCheckTransactionsStatusTask } from './check-transaction-status-task';
import { HttpService } from '@nestjs/axios';
import { statusListeners } from './notification-transaction';
import { request } from 'http';
import { userProfile } from 'src/util/keycloak-auth-util';
import { getDomainUrl } from 'src/util/domain-util';
import { StripeService } from './payment-services/stripe/stripe.service';

@ApiTags('Transaction')
@Controller('transactions')
export class TransactionsController {
  private paymentServices: Record<PaymentMethod, PaymentService>;
  constructor(
    private httpService: HttpService,
    private readonly mvolaService: MvolaService,
    private readonly stripeService: StripeService,

    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly transactionService: TransactionsService,
  ) {
    this.paymentServices = {
      MVOLA: mvolaService,
      PAYPAL: null,
      CREDIT_CARD: stripeService
    };

    launchCheckTransactionsStatusTask({
      logger,
      paymentServices: this.paymentServices,
      transactionService,
      httpService: this.httpService,
    });
  }

  @ApiOAuth2([])
  @UseGuards(UserGuard)
  @Get('/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of transaction',
    type: () => String,
  })
  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiResponse({
    status: 200,
    description: 'The transaction found',
    type: () => Transaction,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    type: () => NotFoundHttpException,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    type: () => ForbiddenHttpException,
  })
  async getTransaction(
    @Param('id') id: string,
    // @RequestUser() requestUser: User,
  ) {
    const username = ''
    this.logger.info(`Get transaction ${username} , id=${id}`);

    const transaction = await this.transactionService.findOne({
      id: id as any,
    });

    if (!transaction) {
      this.logger.warn(
        `Not found transaction ${username} , id=${id}`,
      );

      throw new NotFoundException(`Not found transaction ${id}`);
    }

    return transaction;
  }

  @ApiSecurity('oauth2')
  @UseGuards(UserGuard)
  @Post('/pay')
  @ApiOperation({ summary: 'Payment' })
  @ApiQuery({
    description: 'Wait response',
    name: 'wait',
    type: () => Boolean,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'The payment is successful',
    type: () => Transaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request.',
    type: () => BadRequestHttpException,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden.',
    type: () => ForbiddenHttpException,
  })
  async pay(
    @Body() payment: Payment,
    @Req() request: any,
    @Query('wait') waitAsString?: string,
  ) {
    const wait = waitAsString === 'true';
    const user = await userProfile(request);
    this.logger.info(`Payment userId=${user.id}, username=${user.displayName} - wait ${wait}`, payment);

    const transaction = await this.transactionService.initPayment({
      payment,
      user,
    });

    const service = this.paymentServices[payment.method];

    if (!service) {
      this.logger.error(
        `Unknown Payment method ${payment.method} - userId=${user.id}, username=${user.displayName} `,
        payment,
      );

      throw new BadRequestException(`Unknown Payment method ${payment.method}`);
    }

    const domainUrl = getDomainUrl(request);

    const initResponse = await service.merchantPaymentTransactionInit(
      user,
      payment,
      transaction,
      { domainUrl }
    );

    const transactionResponse =
      await this.transactionService.updateOneTransaction(
        transaction.id,
        initResponse,
      );

    if (wait && !transactionResponse.checkoutUrl) {
      return new Promise((resolve, reject) => {
        statusListeners[transactionResponse.id.toString()] = resolve;
      });
    }

    return transactionResponse;
  }
}
