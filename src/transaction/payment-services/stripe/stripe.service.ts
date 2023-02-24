import { Inject, Injectable } from "@nestjs/common";
import { Payment } from "src/transaction/dto/payment.dto";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { User } from "src/util/User";
import { PaymentService } from "../PaymentService";
import Stripe from "stripe";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { ConfigService } from "@nestjs/config";
import { StripeConfig } from "src/config/stripe.config";
import { TransactionsService } from "src/transaction/transactions.service";


const CURRENCIES_DECIMALS_MULTIPLIER = {
    MGA: 1,
    EUR: 100
}
@Injectable()
export class StripeService implements PaymentService {
    private stripe: Stripe;
    private config: StripeConfig;

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly transactionService: TransactionsService,

    ) {

        this.config = this.configService.get<StripeConfig>('stripe');

        this.stripe = new Stripe(this.config.secretKey, {
            apiVersion: '2022-08-01',
            typescript: true
        });
    }

    merchantPaymentTransactionInit = async (user: User, payment: Payment, transaction: Transaction,
        options: { domainUrl: string }
    ): Promise<Partial<Transaction>> => {

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: transaction.currency,
                        unit_amount: payment.amount * CURRENCIES_DECIMALS_MULTIPLIER[transaction.currency],
                        product_data: {
                            name: transaction.label || transaction.description || 'Payment Service'
                        }
                    },
                    quantity: 1
                }
            ],
            success_url: `${options.domainUrl}/stripe/success?id=${transaction.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${options.domainUrl}/stripe/cancel?id=${transaction.id}&session_id={CHECKOUT_SESSION_ID}`,
        });


        return this.transactionService.updateOneTransaction(transaction.id, { checkoutUrl: session.url })

    }
    merchantPaymentTransactionStatus = async (transaction: Transaction): Promise<Partial<Transaction>> => {


        return transaction
    }


    getStripe = () => this.stripe


}