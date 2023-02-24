import { Column, Entity, ObjectID, ObjectIdColumn, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Payment_transaction' })
export class Transaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'correlation_id' })
  correlationId: string;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Column({ name: 'external_transaction_id' })
  externalTransactionId: string;

  @Column()
  method: string; // telma | paypal | bniPay

  @Column()
  amount: number;

  @Column()
  currency: string; // Ar

  @Column({ type: 'datetime' })
  date: Date;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  status: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'callback_url' })
  callbackUrl: string;

  @Column({ name: 'redirect_url' })
  redirectUrl: string;

  @Column({ name: 'checkout_url' })
  checkoutUrl?: string;

  @Column()
  description: string;

  @Column()
  label: string;
}
