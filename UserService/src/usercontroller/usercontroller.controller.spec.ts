import { Test, TestingModule } from '@nestjs/testing';
import { UsercontrollerController } from './usercontroller.controller';
import { UserservicesService } from 'src/userservices/userservices.service';

describe('UsercontrollerController', () => {
  let controller: UsercontrollerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsercontrollerController],
      providers: [
        {
          provide: UserservicesService,
          useValue: {
            CreateUser: jest.fn(),
            Login: jest.fn(),
            GetUserByEmail: jest.fn(),
            logout: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsercontrollerController>(UsercontrollerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
