import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TimeOffBalance } from '../time-off/time-off-balance.entity';
import { TimeOffRequest } from '../time-off/time-off-request.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @OneToMany(() => TimeOffBalance, (balance) => balance.employee)
  balances: TimeOffBalance[];

  @OneToMany(() => TimeOffRequest, (request) => request.employee)
  requests: TimeOffRequest[];
}
