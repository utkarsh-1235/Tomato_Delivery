import { Test, TestingModule } from '@nestjs/testing';
import { UserservicesService } from './userservices.service';
import { Role } from 'src/user/Role';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed-password'),
  compare: jest.fn(async () => true),
}));

describe('UserservicesService', () => {
  let service: UserservicesService;
  let jwtService: JwtService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserservicesService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: { connect: jest.fn(), emit: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserservicesService>(UserservicesService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should create a new user', async () => {
    const userDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      role: Role.User,
    };
    // ✅ mock no existing user
    mockUserRepository.findOne.mockResolvedValue(null);

    const createdUser = {
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      password: 'hashed-password',
      role: userDto.role,
    };
    mockUserRepository.create.mockReturnValue(createdUser);

    const savedUser = { id: '1', ...createdUser };
    mockUserRepository.save.mockResolvedValue(savedUser);

    const result = await service.CreateUser(userDto);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: userDto.email },
    });

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      password: 'hashed-password',
      role: userDto.role,
    });

    expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);

    expect(result.status).toBe(true);
    expect(result.message).toBe('User registered successfully');
    expect(result.data).toEqual({
      id: '1',
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      role: userDto.role,
    });
  });

  it('should login a user', async () => {
    const userLoginDto = {
      email: 'john.doe@example.com',
      password: 'password',
    };
    const existingUser = {
      id: '1',
      email: userLoginDto.email,
      password: 'hashed-password',
      role: Role.User,
    };
    mockUserRepository.findOne.mockResolvedValue(existingUser);
    (jwtService.sign as jest.Mock).mockReturnValue('fake-jwt');

    const result = await service.Login(userLoginDto);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: userLoginDto.email },
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      userLoginDto.password,
      existingUser.password,
    );

    expect(jwtService.sign).toHaveBeenCalledWith({
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    });

    expect(result.status).toBe(true);
    expect(result.message).toBe('Loggedin successfully');
  });

  it('should throw if password is invalid', async () => {
    const userLoginDto = {
      email: 'john.doe@example.com',
      password: 'wrong-password',
    };
    const existingUser = {
      id: '1',
      email: userLoginDto.email,
      password: 'hashed-password',
      role: Role.User,
    };
    mockUserRepository.findOne.mockResolvedValue(existingUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.Login(userLoginDto)).rejects.toThrow('Invalid Password');
  });
});
