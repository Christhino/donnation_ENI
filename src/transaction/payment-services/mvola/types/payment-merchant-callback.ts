import { KeyValuePair } from './key-value';

export interface PaymentMerchantCallback {
  transactionStatus: 'completed' | 'failed';
  serverCorrelationId: string;
  transactionReference: string;
  requestDate: string;
  debitParty: KeyValuePair<'msisdn', string>[];
  creditParty: KeyValuePair<'msisdn', string>[];
  fees?: { feeAmount: string }[];
  metadata?: KeyValuePair[];
}
