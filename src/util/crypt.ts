import * as bcryptjs from 'bcryptjs';

export const comparePassword = async (
  password: string,
  clearPassword: string,
) => {
  if (process.env.SECURITY_ENABLE_ENCRYPTION === 'false') {
    return password === clearPassword;
  }

  return bcryptjs.compare(clearPassword, password);
};

export const hashPassword = async (password: string) => {
  if (process.env.SECURITY_ENABLE_ENCRYPTION === 'false') {
    return password;
  }

  return bcryptjs.hash(password, 10);
};
