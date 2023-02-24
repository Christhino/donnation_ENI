import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MvolaConfig } from 'src/config/mvola.config';
import { Token } from '../../Token';
import { PaymentService } from '../PaymentService';
import { Payment } from 'src/transaction/dto/payment.dto';
import {
  PaymentMerchantCallback,
  PaymentMerchantInitOptions,
  PaymentMerchantInitResponse,
  PaymentMerchantStatusResponse,
} from './types';
import { cleanObject } from 'src/util/clean-object';
import { TransactionStatus } from '../TransactionStatus';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionsService } from 'src/transaction/transactions.service';
import { User } from 'src/util/User';
import { catchError, of } from 'rxjs';

const msisnFormat = (phoneNumber: string) => {
  return `msisdn;${phoneNumber}`;
};


const CURRENCIES_MAPPING = {
  MGA:'Ar'
}

@Injectable()
export class MvolaService implements PaymentService {
  private token: Token;
  private config: MvolaConfig;

  constructor(
    // private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService,
    private httpService: HttpService,
    private readonly transactionService: TransactionsService,
  ) {
    this.config = this.configService.get<MvolaConfig>('mvola');
  }

  getToken = async (): Promise<Token> => {
    if (this.token?.isValid()) {
      return this.token;
    }

    const url = `${this.config.baseUrl}/token`;
    this.logger.info(`[MvolaService] Get token ${url}`);
    const data = `grant_type=client_credentials&scope=EXT_INT_MVOLA_SCOPE`;

    return new Promise<Token>((resolve, reject) => {
      this.httpService
        .post(url, data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
          },
          auth: {
            username: this.config.consumerKey,
            password: this.config.consumerSecret,
          },
        })
        .pipe((catchError((error) => {
          return of({ status: 500, statusText: error.message, data: error })
        })))
        .subscribe((response) => {
          this.logger.info(
            `[MvolaService] Get token result status=${response.status
            }, statusText=${response.statusText}, data=${JSON.stringify(
              response.data,
            )}`,
          );

          if (response.status === 200) {
            this.token = new Token({
              accessToken: response.data.access_token,
              scope: response.data.scope,
              tokenType: response.data.token_type,
              expiresIn: response.data.expires_in,
            });

            resolve(this.token);
          } else {
            reject(response.data ? JSON.stringify(
              response.data,
            ) : undefined);
          }
        });
    });
  };

  merchantPaymentTransactionInit = async (
    user: User,//User,
    payment: Payment,
    transaction: Transaction,
    options: { domainUrl: string }

  ): Promise<Partial<Transaction>> => {
    let callbackUrl = `${options.domainUrl}/mvola/notify`;


    return this.doMerchantPaymentTransactionInit({
      correlationId: transaction.id.toString(),
      userLanguage: 'FR',
      userAccountIdentifier: msisnFormat(payment.from),
      partnerName: user.id,
      amount: payment.amount.toString(),
      currency: payment.currency,
      descriptionText: payment.description,
      requestDate: transaction.date.toISOString(),
      debitParty: [
        {
          key: 'msisdn',
          value: transaction.from,
        },
      ],
      creditParty: [
        {
          key: 'msisdn',
          value: transaction.to,
        },
      ],
      requestingOrganisationTransactionReference: transaction.id.toString(),
      originalTransactionReference: payment.externalTransactionId,
      metadata: [{ key: 'partnerName', value: user.id }],
      callbackUrl,
    });
  };

  merchantPaymentTransactionStatus = async (
    transaction: Transaction,
  ): Promise<Partial<Transaction>> => {
    const token = await this.getToken();


    const url = `${this.config.baseUrl}/mvola/mm/transactions/type/merchantpay/1.0.0/status/${transaction.correlationId}`;
    this.logger.info(
      `[MvolaService] Get status Merchant Payment transaction ${url}`,
    );

    const headers: Record<string, any> = cleanObject({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Authorization: `Bearer ${token.getValue().accessToken}`,
      Version: '1.0',
      'X-CorrelationID': transaction.id,
      UserAccountIdentifier: msisnFormat(transaction.from),
      partnerName: transaction.userId,
    });

    return new Promise<Partial<Transaction>>((resolve, reject) => {
      this.httpService.get(url, { headers }).subscribe(async (response) => {
        this.logger.info(
          `[MvolaService] merchantPaymentTransactionStatus result status=${response.status
          }, statusText=${response.statusText}, data=${JSON.stringify(
            response.data,
          )}`,
        );

        if (response.status === 200) {
          const data = response.data as PaymentMerchantStatusResponse;
          const refreshTransaction = await this.transactionService.findOne({
            correlationId: data.serverCorrelationId,
          });

          if (refreshTransaction) {
            resolve({
              correlationId: data.serverCorrelationId,
              transactionId: data.objectReference || undefined,
              status:
                data.status === 'pending'
                  ? TransactionStatus.PENDING
                  : data.status === 'completed'
                    ? TransactionStatus.COMPLETED
                    : TransactionStatus.FAILED,
            });
          } else {
            reject(`Not found correlation id ${data.serverCorrelationId}`);
          }
        } else {
          reject();
        }
      });
    });
  };

  private doMerchantPaymentTransactionInit = async (
    options: PaymentMerchantInitOptions,
  ): Promise<Partial<Transaction>> => {
    const token = await this.getToken();

    const url = `${this.config.baseUrl}/mvola/mm/transactions/type/merchantpay/1.0.0/`;
    this.logger.info(`[MvolaService] Init Merchant Payment transaction ${url}`);

    const headers: Record<string, any> = cleanObject({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Authorization: `Bearer ${token.getValue().accessToken}`,
      Version: '1.0',
      'X-CorrelationID': options.correlationId,
      UserLanguage: options.userLanguage,
      UserAccountIdentifier: options.userAccountIdentifier,
      partnerName: options.partnerName,
      'X-Callback-URL': options.callbackUrl,
    });

    const data = cleanObject({
      amount: options.amount,
      currency: CURRENCIES_MAPPING[options.currency],
      requestDate: options.requestDate,
      debitParty: options.debitParty,
      creditParty: options.creditParty,
      requestingOrganisationTransactionReference:
        options.requestingOrganisationTransactionReference,
      originalTransactionReference: options.originalTransactionReference,
      metadata: options.metadata,
      descriptionText: options.descriptionText,
    });

    this.logger.info(`[MvolaService] Merchant Payment transaction`, {
      data,
      headers,
    });

    return new Promise((resolve, reject) => {
      this.httpService
        .post(url, data, {
          headers,
        })
        .subscribe((response) => {
          this.logger.info(
            `[MvolaService] MerchantPaymentTransactionInit result status=${response.status
            }, statusText=${response.statusText}, data=${JSON.stringify(
              response.data,
            )}`,
          );

          if (response.status >= 200 && response.status < 300) {
            const data = response.data as PaymentMerchantInitResponse;
            if (data.status === 'pending') {
              resolve({
                status: TransactionStatus.PENDING,
                correlationId: data.serverCorrelationId,
              });
            } else {
              reject(`Unknown status ${data.status}`);
            }
          } else {
            reject();
          }
        });
    });
  };

  paymentMerchantTransactionCallback = async (
    response: PaymentMerchantCallback,
  ) => {
    this.logger.info(`[MvolaService] Transaction callback `, response);

    const transaction = await this.transactionService.findOne({
      correlationId: response.serverCorrelationId,
    });

    if (!transaction) {
      this.logger.error(
        `[MvolaService] Transaction callback. Transaction not found`,
        response,
      );

      return Promise.reject(`Transaction not found`);
    }

    return this.transactionService.updateOneTransaction(transaction.id as any, {
      status:
        response.transactionStatus === 'completed'
          ? TransactionStatus.COMPLETED
          : TransactionStatus.FAILED,
      transactionId: response.transactionReference || undefined,
    });
  };
}
