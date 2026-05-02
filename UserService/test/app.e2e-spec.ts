import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from 'src/user/Role';
import { UsercontrollerController } from 'src/usercontroller/usercontroller.controller';
import { UserservicesService } from 'src/userservices/userservices.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed-password'),
  compare: jest.fn(async () => true),
}));

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let redisClient: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsercontrollerController],
      providers: [
        UserservicesService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            connect: jest.fn(),
            emit: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'fake.jwt.token'),
            verify: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 60 })),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          const authHeader = req?.headers?.authorization ?? '';
          if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
            return false;
          }
          req.user = {
            userId: 1,
            email: 'john.doe@example.com',
            role: Role.User,
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    redisClient = moduleFixture.get('REDIS_CLIENT');
    jwtService = moduleFixture.get(JwtService);
  });

  it('/users/register (201) - registers a new user', async () => {
    userRepository.findOne.mockResolvedValue(null);
    userRepository.save.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashed',
      role: Role.User,
    });

    const res = await request(app.getHttpServer()).post('/users/register').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        role: Role.User,
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      status: true,
      message: 'User registered successfully',
      data: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.User,
      },
    });
  });

  it('/users/register (409) - rejects duplicate email', async () => {
    userRepository.findOne.mockResolvedValue({ id: 99 });

    const res = await request(app.getHttpServer()).post('/users/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      role: Role.User,
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      statusCode: 409,
      message: 'User already exists',
      error: 'Conflict',
    });
  });

  it('/users/login (200) - logs in a user', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed-password',
      role: Role.User,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await request(app.getHttpServer()).post('/users/login').send({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      message: 'Loggedin successfully',
    });
  });

  it('/users/login (409) - rejects non-existent user', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const res = await request(app.getHttpServer()).post('/users/login').send({
      email: 'john.doe@example.com',
      password: 'password',
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      statusCode: 409,
      message: 'User not exist, please register',
      error: 'Conflict',
    });
  });

  it('/users/login (409) - rejects invalid password', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'john.doe@example.com',
      password: 'hashed-password',
      role: Role.User,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await request(app.getHttpServer()).post('/users/login').send({
      email: 'john.doe@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      statusCode: 409,
      message: 'Invalid Password',
      error: 'Conflict',
    });
  });

  it('/users/profile (401) - rejects missing token', async () => {
    const res = await request(app.getHttpServer()).get('/users/profile');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });

  it('/users/profile (200) - returns cached user', async () => {
    redisClient.get.mockResolvedValue(
      JSON.stringify({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.User,
      }),
    );

    const res = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: true,
      message: 'User fetched from cache',
      data: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.User,
      },
    });
  });

  it('/users/logout (401) - rejects missing token', async () => {
    const res = await request(app.getHttpServer()).post('/users/logout');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });
  });

  it('/users/logout (200) - logs out successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/logout')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true, message: 'Logged out successfully' });
  });

  it('/users/logout (200) - returns invalid/expired token message', async () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('bad token');
    });

    const res = await request(app.getHttpServer())
      .post('/users/logout')
      .set('Authorization', 'Bearer bad-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: false, message: 'Invalid or expired token' });
  });

  it('/users/update (200) - updates user', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashed-password',
      role: Role.User,
    });
    userRepository.save.mockResolvedValue({
      id: 1,
      firstName: 'Johnny',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashed-password',
      role: Role.User,
    });

    const res = await request(app.getHttpServer())
      .put('/users/update')
      .query({ email: 'john.doe@example.com' })
      .send({ firstName: 'Johnny' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'john.doe@example.com is successfully updated',
      data: {
        id: 1,
        firstName: 'Johnny',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.User,
      },
    });
  });

  it('/users/update (404) - rejects missing user', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .put('/users/update')
      .query({ email: 'missing@example.com' })
      .send({ firstName: 'Nope' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      statusCode: 404,
      message: 'User not found',
      error: 'Not Found',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
