import { Controller, Post, Body, Get } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async create(@Body() body: { name: string; location: string }) {
    return this.employeeService.create(body.name, body.location);
  }

  @Get()
  async findAll() {
    return this.employeeService.findAll();
  }
}
