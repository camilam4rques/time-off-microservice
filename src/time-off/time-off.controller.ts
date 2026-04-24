import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { TimeOffService } from './time-off.service';

@Controller('time-off')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Post('requests')
  async createRequest(
    @Body() body: { employeeId: number; type: string; startDate: string; endDate: string },
  ) {
    return this.timeOffService.createRequest(body.employeeId, body.type, body.startDate, body.endDate);
  }

  @Put('requests/:id/approve')
  async approveRequest(@Param('id') id: string) {
    return this.timeOffService.approveRequest(+id);
  }

  @Get('employees/:employeeId/balances')
  async getBalances(@Param('employeeId') employeeId: string) {
    return this.timeOffService.getBalances(+employeeId);
  }

  @Get('requests')
  async getAllRequests() {
    return this.timeOffService.getAllRequests();
  }
}
