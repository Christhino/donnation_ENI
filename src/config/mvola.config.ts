import { registerAs } from '@nestjs/config';

export interface MvolaConfig {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string;
}

export default registerAs('mvola', (): MvolaConfig => {
  return {
    consumerSecret: process.env.MVOLA_CONSUMER_SECRET,
    consumerKey: process.env.MVOLA_CONSUMER_KEY,
    baseUrl: process.env.MVOLA_API_BASE_URL,
  };
});
