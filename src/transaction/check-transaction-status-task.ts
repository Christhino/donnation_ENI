import { HttpService } from '@nestjs/axios';
import { Logger } from 'winston';
import { notifyTransaction } from './notification-transaction';
import { PaymentMethod } from './payment-services/PaymentMethod';
import { PaymentService } from './payment-services/PaymentService';
import { TransactionsService } from './transactions.service';

interface CheckTransactionStatusTaskOptions {
  paymentServices: Record<PaymentMethod, PaymentService>;
  transactionService: TransactionsService;
  logger: Logger;
  httpService: HttpService;
}

export const launchCheckTransactionsStatusTask = async (
  options: CheckTransactionStatusTaskOptions,
) => {
  const remaining = await doLaunchCheckTransactionsStatus(options, 0, 20);

  options.logger.info(
    `[Task] launchCheckTransactionsStatusTask remaining =${remaining}`,
  );
  if (remaining > 0) {
    setTimeout(() => {
      launchCheckTransactionsStatusTask(options);
    }, 10000);
  }
};

const doLaunchCheckTransactionsStatus = async (
  options: CheckTransactionStatusTaskOptions,
  offset: number,
  limit: number,
) => {
  const transactions = await options.transactionService.getRepository().find({
    skip: offset,
    take: limit,
    where: {
      status: 'PENDING',
    },
    order: {
      date: 'ASC',
    },
  });

  let count = 0;
  if (transactions.length) {
    await transactions.reduce((prevPromise, transaction) => {
      return prevPromise.then(async () => {
        try {
          const paymentService: PaymentService =
            options.paymentServices[transaction.method];
          if (paymentService) {
            const statusResponse =
              await paymentService.merchantPaymentTransactionStatus(
                transaction,
              );

            if (
              statusResponse &&
              statusResponse.status.toLowerCase() !== 'pending'
            ) {
              await options.transactionService.updateOneTransaction(
                transaction.id,
                statusResponse,
              );

              //TODO: Callback

              notifyTransaction({
                logger: options.logger,
                httpService: options.httpService,
                transaction,
              });
            } else {
              count++;
            }
          }
        } catch (error) {}
      });
    }, Promise.resolve());

    return (
      count +
      (await doLaunchCheckTransactionsStatus(options, offset + limit, limit))
    );
  }

  return count;
};
