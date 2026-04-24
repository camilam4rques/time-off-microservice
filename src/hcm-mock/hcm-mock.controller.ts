import { Controller, Post, Body } from '@nestjs/common';
import { TimeOffService } from '../time-off/time-off.service';
import { HcmMockService } from './hcm-mock.service';

@Controller('hcm')
export class HcmMockController {
  constructor(
    private readonly timeOffService: TimeOffService,
    private readonly hcmMockService: HcmMockService,
  ) {}

  @Post('sync-balance')
  async syncBalance(
    @Body() body: { employeeId: number; type: string; newBalance: number },
  ) {
    this.hcmMockService.simulateHcmOperation();
    return this.timeOffService.syncBalance(body.employeeId, body.type, body.newBalance);
  }
}
