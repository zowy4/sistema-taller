import { Test, TestingModule } from '@nestjs/testing';
import { PortalController } from './portal.controller';

describe('PortalController', () => {
  let controller: PortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortalController],
    }).compile();

    controller = module.get<PortalController>(PortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
