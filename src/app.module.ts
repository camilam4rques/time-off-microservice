import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { TimeOffModule } from './time-off/time-off.module';
import { HcmMockModule } from './hcm-mock/hcm-mock.module';
import { Employee } from './employee/employee.entity';
import { TimeOffBalance } from './time-off/time-off-balance.entity';
import { TimeOffRequest } from './time-off/time-off-request.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Employee, TimeOffBalance, TimeOffRequest],
      synchronize: true,
    }),
    EmployeeModule,
    TimeOffModule,
    HcmMockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
