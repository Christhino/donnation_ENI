/**
200 - OK Everything worked as expected.
400 - Bad Request The request was unacceptable, often due
to missing a required parameter.
401 - Unauthorized No valid API key provided.
402 - Request Failed The parameters were valid but the request
failed.
403 - Forbidden The API key doesn't have permissions to
perform the request.
404 - Not Found The requested resource doesn't exist.
409 - Conflict
The request conflicts with another request
(perhaps due to using the same
idempotent key).
429 - Too Many
Requests
Too many requests hit the API too quickly.
We recommend an exponential backoff of
your requests.
500, 502, 503, 504 -
Server Errors Something went wrong on the server */

export interface InternalOrTransactionError {
  ErrorCategory: string;
  ErrorCode: string;
  ErrorDescription: string;
  ErrorDateTime: string;
  ErrorParameters: Record<string, any>;
}

export interface CredentialsError {
  fault: {
    code: number;
    description: string;
    message: string;
  };
}

export type ResponseError = InternalOrTransactionError | CredentialsError;
