import { Test, TestingModule } from '@nestjs/testing';
import { UserservicesService } from './userservices.service';

describe('UserservicesService', () => {
  let service: UserservicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserservicesService],
    }).compile();

    service = module.get<UserservicesService>(UserservicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
