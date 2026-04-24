import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeOffRequest, RequestStatus } from './time-off-request.entity';
import { TimeOffBalance } from './time-off-balance.entity';
import { Employee } from '../employee/employee.entity';

@Injectable()
export class TimeOffService {
  constructor(
    @InjectRepository(TimeOffRequest)
    private requestRepository: Repository<TimeOffRequest>,
    @InjectRepository(TimeOffBalance)
    private balanceRepository: Repository<TimeOffBalance>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async createRequest(employeeId: number, type: string, startDate: string, endDate: string): Promise<TimeOffRequest> {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const balance = await this.balanceRepository.findOne({ where: { employee: { id: employeeId }, type } });
    if (!balance) throw new BadRequestException(`No balance found for type: ${type}`);

    const daysRequested = this.calculateDays(new Date(startDate), new Date(endDate));
    if (balance.availableDays < daysRequested) {
      throw new BadRequestException('Insufficient balance');
    }

    const request = this.requestRepository.create({
      employee,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      daysRequested,
      status: RequestStatus.PENDING,
    });

    return this.requestRepository.save(request);
  }

  async approveRequest(id: number): Promise<TimeOffRequest> {
    return this.requestRepository.manager.transaction(async (transactionalEntityManager) => {
      const request = await transactionalEntityManager.findOne(TimeOffRequest, {
        where: { id },
        relations: ['employee'],
      });

      if (!request) throw new NotFoundException('Request not found');
      
      // Idempotency check
      if (request.status === RequestStatus.APPROVED) return request;
      if (request.status !== RequestStatus.PENDING) throw new BadRequestException('Request is not pending');

      // Balance check - explicitly searching for the balance associated with the employee and type
      const balance = await transactionalEntityManager.findOne(TimeOffBalance, {
        where: { 
          employee: { id: request.employee.id }, 
          type: request.type 
        },
      });

      if (!balance) {
        throw new BadRequestException('No balance found for this employee and type');
      }

      if (balance.availableDays < request.daysRequested) {
        request.status = RequestStatus.REJECTED;
        await transactionalEntityManager.save(request);
        throw new BadRequestException('Insufficient balance at approval time');
      }

      balance.availableDays -= request.daysRequested;
      await transactionalEntityManager.save(balance);

      request.status = RequestStatus.APPROVED;
      return transactionalEntityManager.save(request);
    });
  }

  async syncBalance(employeeId: number, type: string, newBalance: number): Promise<TimeOffBalance> {
    let balance = await this.balanceRepository.findOne({ where: { employee: { id: employeeId }, type } });
    
    if (!balance) {
      const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
      if (!employee) throw new NotFoundException('Employee not found');
      balance = this.balanceRepository.create({ employee, type, availableDays: newBalance });
    } else {
      balance.availableDays = newBalance;
    }

    return this.balanceRepository.save(balance);
  }

  private calculateDays(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  async getBalances(employeeId: number): Promise<TimeOffBalance[]> {
    return this.balanceRepository.find({ where: { employee: { id: employeeId } } });
  }

  async getAllRequests(): Promise<TimeOffRequest[]> {
    return this.requestRepository.find({ relations: ['employee'] });
  }
}
