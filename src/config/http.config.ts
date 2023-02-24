import { HttpModuleOptions } from '@nestjs/axios';
import { registerAs } from '@nestjs/config';

export default registerAs('http', (): HttpModuleOptions => {
  return {
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS, 10),
    timeout: parseInt(process.env.HTTP_TIMEOUT, 10),
  };
});
