import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PaymentMethod } from '../payment-services/PaymentMethod';

export class Payment {
  @ApiProperty({
    description: 'The client side transaction id',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalTransactionId: string;

  @ApiProperty({
    description: 'Amount of transaction',
    example: 200,
  })

  amount: number;

  @ApiProperty({
    description: 'Label of transaction',
    example: 'SUBSCRIPTION',
  })
  label: string;

  @ApiProperty({
    description: 'Currency code of the transaction',
    example: 'MGA',
    required: false,
    default: 'MGA',
  })
  @IsString()
  @IsOptional()
  currency: string; // Ar

  @ApiProperty({
    description: 'Identifier of debitor',
    example: '0343500003',
  })
  @IsString()
  @IsOptional()
  from: string;

  @ApiProperty({
    description: 'Identifier of creditor',
    example: '0343500004',
  })
  @IsString()
  @IsOptional()
  to: string;

  @ApiProperty({
    description: 'The callback url. This is used to notify server. Post transaction',
    required: false,
  })
  @IsString()
  @IsOptional()
  callbackUrl: string;


  @ApiProperty({
    description: 'The redict url. This is used to redirect client to a notification url',
    required: false,
  })
  @IsString()
  @IsOptional()
  redirectUrl: string;

  @ApiProperty({
    description:
      'Description on transaction. At most 50 characters long without special character except : “- “, “.”, “_ “, “,”',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ enum: PaymentMethod, enumName: 'PaymentMethod' })
  method: PaymentMethod;
}
