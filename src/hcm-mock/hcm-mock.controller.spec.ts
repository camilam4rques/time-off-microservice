import { Test, TestingModule } from '@nestjs/testing';
import { HcmMockController } from './hcm-mock.controller';

describe('HcmMockController', () => {
  let controller: HcmMockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HcmMockController],
    }).compile();

    controller = module.get<HcmMockController>(HcmMockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
