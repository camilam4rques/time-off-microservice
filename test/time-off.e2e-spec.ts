import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('TimeOff (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    } catch (error) {
      console.error('Error during beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create an employee, sync balance, and handle a time-off request', async () => {
    // 1. Create Employee
    const empRes = await request(app.getHttpServer())
      .post('/employees')
      .send({ name: 'Camila', location: 'Brazil' })
      .expect(201);
    
    const employeeId = empRes.body.id;

    // 2. Sync Balance via HCM Mock
    await request(app.getHttpServer())
      .post('/hcm/sync-balance')
      .send({ employeeId, type: 'vacation', newBalance: 10 })
      .expect(201);

    // 3. Check Balance
    const balRes = await request(app.getHttpServer())
      .get(`/time-off/employees/${employeeId}/balances`)
      .expect(200);
    
    expect(balRes.body[0].availableDays).toBe(10);

    // 4. Create Time-Off Request (2 days)
    const reqRes = await request(app.getHttpServer())
      .post('/time-off/requests')
      .send({
        employeeId,
        type: 'vacation',
        startDate: '2026-05-01',
        endDate: '2026-05-02',
      })
      .expect(201);
    
    const requestId = reqRes.body.id;

    // 5. Approve Request
    await request(app.getHttpServer())
      .put(`/time-off/requests/${requestId}/approve`)
      .expect(200);

    // 6. Verify Updated Balance (10 - 2 = 8)
    const finalBalRes = await request(app.getHttpServer())
      .get(`/time-off/employees/${employeeId}/balances`)
      .expect(200);
    
    expect(finalBalRes.body[0].availableDays).toBe(8);
  });

  it('should reject request if balance is insufficient', async () => {
    const empRes = await request(app.getHttpServer())
      .post('/employees')
      .send({ name: 'John', location: 'USA' })
      .expect(201);
    
    const employeeId = empRes.body.id;

    await request(app.getHttpServer())
      .post('/hcm/sync-balance')
      .send({ employeeId, type: 'vacation', newBalance: 1 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/time-off/requests')
      .send({
        employeeId,
        type: 'vacation',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
      })
      .expect(400);
  });
});
