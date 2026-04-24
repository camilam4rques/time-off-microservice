import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeOffService } from './time-off.service';
import { TimeOffController } from './time-off.controller';
import { TimeOffRequest } from './time-off-request.entity';
import { TimeOffBalance } from './time-off-balance.entity';
import { Employee } from '../employee/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeOffRequest, TimeOffBalance, Employee])],
  providers: [TimeOffService],
  controllers: [TimeOffController],
  exports: [TimeOffService],
})
export class TimeOffModule {}
