import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Employee } from '../employee/employee.entity';

@Entity()
export class TimeOffBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // e.g., 'vacation', 'sick'

  @Column('float')
  availableDays: number;

  @ManyToOne(() => Employee, (employee) => employee.balances)
  employee: Employee;
}
