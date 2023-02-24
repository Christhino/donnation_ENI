import { Controller, Inject, Put, Body, Get, Req, Post, Query, Res, Redirect, HttpStatus } from '@nestjs/common';
import { TransactionsService } from 'src/transaction/transactions.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { notifyTransaction } from 'src/transaction/notification-transaction';
import { HttpService } from '@nestjs/axios';
import Stripe from "stripe";
import { StripeService } from './stripe.service';
import { TransactionStatus } from '../TransactionStatus';
import { Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';


@Controller('stripe')

export class StripeController {
  constructor(
    private httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly transactionService: TransactionsService,
    private readonly stripeService: StripeService,


  ) {



  }


  @Post('/notify')
  @ApiExcludeEndpoint()
  async notifyPayment(
    @Req() req: any,
    @Body() body: any,
  ) {

    let event: Stripe.Event;

    try {
      event = this.stripeService.getStripe().webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return;
    }


    const data: Stripe.Event.Data = event.data;
    const eventType: string = event.type;



    if (eventType === "payment_intent.succeeded") {
      // Cast the event into a PaymentIntent to make use of the types.
      const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
      // Funds have been captured
      // Fulfill any orders, e-mail receipts, etc
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
      console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
      console.log("💰 Payment captured!");
    } else if (eventType === "payment_intent.payment_failed") {
      // Cast the event into a PaymentIntent to make use of the types.
      const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
      console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
      console.log("❌ Payment failed.");
    }


    console.log(`[notifyPayment] Notify `, req, body)

    return { status: 'OK' };
  }


  @Get('/success')
  @ApiExcludeEndpoint()
  async successPayment(
    @Query('id') transactionId: string,
    @Query('session_id') sessionId: string,
    @Res() response: Response
  ) {

    this.doNotifyPaymentStatus(transactionId, sessionId, TransactionStatus.COMPLETED, response);

  }


  @Get('/cancel')
  @ApiExcludeEndpoint()
  async cancelPayment(
    @Query('id') transactionId: string,
    @Query('session_id') sessionId: string,
    @Res() response: Response
  ) {
    this.doNotifyPaymentStatus(transactionId, sessionId, TransactionStatus.FAILED, response);
  }


  private async doNotifyPaymentStatus(
    transactionId: string,
    sessionId: string,
    status: TransactionStatus,
    res: Response
  ) {

    console.log(`[StripeController] Payment transactionId=${transactionId} status=${status}`)

    const session = await this.stripeService.getStripe().checkout.sessions.retrieve(sessionId);

    const transaction =
      await this.transactionService.updateOneTransaction(parseInt(transactionId, 10), {
        status,
        from: session.customer_details?.email || session.customer_details?.phone || session.customer_details?.name,
        transactionId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id,
      });



    notifyTransaction({
      logger: this.logger,
      httpService: this.httpService,
      transaction,
    });

    if (transaction.redirectUrl) {
      const url = new URL(transaction.redirectUrl);
      const searchParams = new URLSearchParams(url.search);
      searchParams.append('id', transaction.id.toString());
      searchParams.append('status', status)
      if (transaction.correlationId) {
        searchParams.append('correlation_id', transaction.correlationId)
      }
      if (transaction.externalTransactionId) {
        searchParams.append('external_transaction_id', transaction.externalTransactionId)

      }
      if (transaction.transactionId) {
        searchParams.append('transaction_id', transaction.transactionId)
      }

      res.redirect(`${url.origin}${url.pathname}?${searchParams.toString()}`)
      return;
    }

    res.status(HttpStatus.OK).json({ status: 'OK' });

  }

}
