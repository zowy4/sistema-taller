import { Test, TestingModule } from '@nestjs/testing';
import { ClientsnpmService } from './clientsnpm.service';

describe('ClientsnpmService', () => {
  let service: ClientsnpmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientsnpmService],
    }).compile();

    service = module.get<ClientsnpmService>(ClientsnpmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
