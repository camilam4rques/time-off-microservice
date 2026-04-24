import { Module } from '@nestjs/common';
import { HcmMockService } from './hcm-mock.service';
import { HcmMockController } from './hcm-mock.controller';
import { TimeOffModule } from '../time-off/time-off.module';

@Module({
  imports: [TimeOffModule],
  providers: [HcmMockService],
  controllers: [HcmMockController],
})
export class HcmMockModule {}
