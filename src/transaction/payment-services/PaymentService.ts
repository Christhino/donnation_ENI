import { User } from 'src/util/User';
import { Payment } from '../dto/payment.dto';
import { Transaction } from '../entities/transaction.entity';

export interface PaymentService {
  merchantPaymentTransactionInit: (
    user: User,
    payment: Payment,
    transaction: Transaction,
    options: { domainUrl: string }
  ) => Promise<Partial<Transaction>>;

  merchantPaymentTransactionStatus: (
    transaction: Transaction,
  ) => Promise<Partial<Transaction>>;
}
