import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Payment } from './dto/payment.dto';
import { User } from 'src/util/User';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  initPayment = ({ payment, user }: { payment: Payment; user: User }) => {
    const transaction: Omit<
      Transaction,
      'id' | 'transactionId' | 'correlationId'
    > = {
      ...payment,
      userId: user.id,
      date: new Date(),
      status: 'INIT',
    };

    return this.transactionRepository.save(transaction);
  };

  updateOneTransaction = (id: number, update: Partial<Transaction>) => {
    return this.transactionRepository
      .update(
        {
          id,
        },
        update,
      )
      .then(() => {
        return this.transactionRepository.findOne(id);
      });
  };

  findOne = async (part: Partial<Transaction>) => {
    return this.transactionRepository.findOne(part);
  };

  getRepository = () => this.transactionRepository;
}
