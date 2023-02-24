import { registerAs } from '@nestjs/config';
import { ConnectionOptions } from 'typeorm';

export default registerAs<Partial<ConnectionOptions>>('database', () => {
  return {
    type: process.env.DATABASE_TYPE as any,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    authSource: 'admin',
    synchronize: false,
  };
});
