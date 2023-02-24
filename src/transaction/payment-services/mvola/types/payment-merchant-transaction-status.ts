export interface PaymentMerchantStatusResponse {
  status: 'pending' | 'completed' | 'failed';
  /**Reference value to correlate transaction in client side */
  serverCorrelationId: string;
  notificationMethod: 'callback' | 'polling';
  objectReference: string;
}
