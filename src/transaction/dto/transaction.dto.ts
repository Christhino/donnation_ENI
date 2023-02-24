import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../payment-services/PaymentMethod';
import { TransactionStatus } from '../payment-services/TransactionStatus';

export class Transaction {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The transaction Id if transaction is successful',
    required: false,
  })
  transactionId: string;

  @ApiProperty({
    description: 'The client side transaction id',
    required: false,
  })
  externalTransactionId: string;

  @ApiProperty({
    description: 'Amount of transaction',
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code of the transaction',
    required: false,
  })
  currency: string; // Ar

  @ApiProperty({
    description: 'Identifier of debitor',
  })
  from: string;

  @ApiProperty({
    description: 'Identifier of creditor',
  })
  to: string;

  @ApiProperty({
    description: 'The callback url',
    required: false,
  })
  callbackUrl: string;

  @ApiProperty({
    description:
      'Description on transaction. At most 50 characters long without special character except : “- “, “.”, “_ “, “,”',
  })
  description: string;

  @ApiProperty({ enum: TransactionStatus, enumName: 'TransactionStatus' })
  status: TransactionStatus;

  @ApiProperty({ enum: PaymentMethod, enumName: 'PaymentMethod' })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Label of transaction',
    required: false,
  })
  label: string;


  @ApiProperty({
    description: 'The checkout url',
    required: false,
  })
  checkoutUrl: string;
}
