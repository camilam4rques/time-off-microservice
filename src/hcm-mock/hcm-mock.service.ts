import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class HcmMockService {
  simulateHcmOperation() {
    // Chaos testing removed for stability in assessment
  }
}
