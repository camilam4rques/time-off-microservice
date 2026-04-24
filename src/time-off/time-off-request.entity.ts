import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Employee } from '../employee/employee.entity';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class TimeOffRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('float')
  daysRequested: number;

  @Column({
    type: 'simple-enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ManyToOne(() => Employee, (employee) => employee.requests)
  employee: Employee;
}
