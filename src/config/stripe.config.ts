import { registerAs } from '@nestjs/config';

export interface StripeConfig {
  secretKey: string;
  publicKey: string;
  webhookSecret: string;
}

export default registerAs('stripe', (): StripeConfig => {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
});

