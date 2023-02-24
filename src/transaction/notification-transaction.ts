import { HttpService } from '@nestjs/axios';
import { Logger } from 'winston';
import { Transaction } from './entities/transaction.entity';

export interface StatusListener {
  (transaction: Transaction): void;
}

export const statusListeners: Record<string, StatusListener> = {};

interface NotificationTransactionOptions {
  transaction: Transaction;
  logger: Logger;
  httpService: HttpService;
}

export const notifyTransaction = ({
  transaction,
  logger,
  httpService,
}: NotificationTransactionOptions) => {
  if (statusListeners[transaction.id.toString()]) {
    statusListeners[transaction.id.toString()](transaction);
    delete statusListeners[transaction.id.toString()];
  }

  if (transaction.callbackUrl) {
    logger.info(
      `[Notification] Notify ${transaction.callbackUrl} for transaction ${transaction.id}`,
    );

    return httpService
      .post(transaction.callbackUrl, transaction, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .subscribe((response) => {
        logger.info(
          `[Notification] Notify ${transaction.callbackUrl} for transaction ${transaction.id}, status=${response.status}, statusText=${response.statusText}`,
          response.data,
        );
      });
  }
};
