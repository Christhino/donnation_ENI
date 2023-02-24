import { KeyValuePair } from './key-value';

export interface PaymentMerchantInitOptions {
  correlationId: string;
  userLanguage: 'FR' | 'MG';
  userAccountIdentifier: string;
  partnerName: string;
  callbackUrl?: string;

  amount: string;
  currency: string; // Ar
  /**Description on transaction. At most 50
    characters long without special character
    except : “- “, “.”, “_ “, “,” */
  descriptionText: string;

  /**Transaction requested date by client -
yyyy-MM-dd'T'HH:mm:ss.SSSZ format */
  requestDate: string;

  debitParty: KeyValuePair<'msisdn', string>[];
  creditParty: KeyValuePair<'msisdn', string>[];

  /**Transaction ID of client side.
At most 50 characters long without special
character except : “- “, “.”, “_ “, “,” */
  requestingOrganisationTransactionReference: string;

  /**At most 50 characters long without special
character except : “- “, “.”, “_ “, “,”

originalTransaction
Reference

Reference number related to the original
transaction. */
  originalTransactionReference: string;

  /**
   * Predefined metadata
   *
   * partnerName : 
        Name of the Partner. At most 50
        characters long without special character
        except : “- “, “.”, “_ “, “,”
   * fc : 
        Foreign currency (euro, dollar, ...)  
   * amountFc : 
        The amount based of
   */
  metadata?: KeyValuePair[];
}

export interface PaymentMerchantInitResponse {
  status: string; // pending
  /**Reference value to correlate transaction in client side */
  serverCorrelationId: string;
  notificationMethod: 'callback' | 'polling';
}
