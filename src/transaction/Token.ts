/**{
  access_token: 'eyJ4NXQiOiJPRE5tWkRFMll6UTRNVEkxTVRZME1tSmhaR00yTUdWa1lUZGhOall5TWpnM01XTmpNalJqWWpnMll6bGpNRGRsWWpZd05ERmhZVGd6WkRoa1lUVm1OZyIsImtpZCI6Ik9ETm1aREUyWXpRNE1USTFNVFkwTW1KaFpHTTJNR1ZrWVRkaE5qWXlNamczTVdOak1qUmpZamcyWXpsak1EZGxZall3TkRGaFlUZ3paRGhrWVRWbU5nX1JTMjU2IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJtdXNpY2hhbGwuc29mdHdhcmVAZ21haWwuY29tQGNhcmJvbi5zdXBlciIsImF1dCI6IkFQUExJQ0FUSU9OIiwiYXVkIjoiNENJT3dCb3d6R1hHc1lTT3BZZHVldEZzajljYSIsIm5iZiI6MTY0NTY0MzUzMiwiYXpwIjoiNENJT3dCb3d6R1hHc1lTT3BZZHVldEZzajljYSIsInNjb3BlIjoiRVhUX0lOVF9NVk9MQV9TQ09QRSIsImlzcyI6Imh0dHBzOlwvXC9hcGltLnByZXAudGVsbWEubWc6OTQ0M1wvb2F1dGgyXC90b2tlbiIsImV4cCI6MTY0NTY0NzEzMiwiaWF0IjoxNjQ1NjQzNTMyLCJqdGkiOiIzMzI0YzMyYy1hMDUyLTRkNzYtYTgzZS1mMDQyODE3YjM0NmUifQ.VEvb_l5STOap2QJ3i1YYHPk63uPsgY5F6m31wu_H8uRfumY3wQ7kRQRjUvkeH0J4RHpBvj-AJ-cP5poCCBmde64CnZe7d1ygQ4Pk49lpZ2OoEUoFLh0TkMErtH5iuFWgV6q47xh6BakGWab5GwnPdQyVAeDvRXixExDDyR6-o-kGG1AMRS0Va08GcnZI9QCeQ_BoyrJw95QK5wdx-Hn_fpIPSTUHFrAEJ9vM1u6yjjSQKY4YWNAzYY_rHORepA0wAOyq8H3uHva83H_kH2CTtV09_5tPolCenbEJwilIKo_2Xg_nf7FCe1ByF8gQRFZUU0kvfy-2yf-MR4D6rHcu_w',
  scope: 'EXT_INT_MVOLA_SCOPE',
  token_type: 'Bearer',
  expires_in: 3600
}
 */

export interface TokenOptions {
  accessToken: string;
  scope: string;
  tokenType: string;
  expiresIn: number; // en seconds
}

const EXPIRATION_TIME_MARGE_IN_MILLS = 5 * 60 * 1000; // 5 minutes
export class Token {
  private expirationTime: number;
  constructor(private value: TokenOptions) {
    this.expirationTime = new Date().valueOf() + value.expiresIn * 1000;
  }

  getValue = () => this.value;

  isValid = () => {
    return (
      new Date().valueOf() + EXPIRATION_TIME_MARGE_IN_MILLS <=
      this.expirationTime
    );
  };
}
