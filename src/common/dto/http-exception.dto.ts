import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForbiddenHttpException {
  @ApiProperty({
    description: 'The http status code',
    example: 403,
  })
  @IsString()
  readonly statusCode: number;

  @ApiProperty({
    description: 'The exception message',
    example: 'Forbidden access',
  })
  @IsString()
  readonly message: string;

  @ApiProperty({
    description: 'The error',
    example: 'Forbidden',
  })
  @IsString()
  readonly error: string;
}

export class UnauthorizedHttpException {
  @ApiProperty({
    description: 'The http status code',
    example: 401,
  })
  @IsString()
  readonly statusCode: number;

  @ApiProperty({
    description: 'The exception message',
    example: 'Not authorized',
  })
  @IsString()
  readonly message: string;

  @ApiProperty({
    description: 'The error',
    example: 'Unauthorized',
  })
  @IsString()
  readonly error: string;
}

export class BadRequestHttpException {
  @ApiProperty({
    description: 'The http status code',
    example: 400,
  })
  @IsString()
  readonly statusCode: number;

  @ApiProperty({
    description: 'The exception message',
    example: 'Bad request',
  })
  @IsString()
  readonly message: string;

  @ApiProperty({
    description: 'The error',
    example: 'Bad Request',
  })
  @IsString()
  readonly error: string;
}

export class NotFoundHttpException {
  @ApiProperty({
    description: 'The http status code',
    example: 404,
  })
  @IsString()
  readonly statusCode: number;

  @ApiProperty({
    description: 'The exception message',
    example: 'Not Found',
  })
  @IsString()
  readonly message: string;

  @ApiProperty({
    description: 'The error',
    example: 'Not found',
  })
  @IsString()
  readonly error: string;
}
