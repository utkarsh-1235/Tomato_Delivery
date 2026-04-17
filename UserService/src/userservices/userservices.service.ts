import { ConflictException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository} from '@nestjs/typeorm';
import { UserDto } from 'src/user/UserRegisterdto';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { UserLoginDto } from 'src/user/UserLoginDto';
import Redis from 'ioredis';
import { UserUpdateDto } from 'src/user/UserUpdateDto';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class UserservicesService {
    constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    @Inject('REDIS_CLIENT')
    private redis: Redis,

    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,

    private jwtService: JwtService,
){}

    async onModuleInit(){
        await this.kafka.connect();
    }
    async CreateUser(userDto: UserDto){
        const {firstName, lastName, email, password, role} = userDto;
        

        //checking user already exist
        const existingUser = await this.userRepository.findOne({
            where: {email},
        });

        if(existingUser){
            throw new ConflictException("User already exists");
        }

        //hashedPassword
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
          });
      
          const savedUser = await this.userRepository.save(user);
        //   console.log(savedUser);
          // ✅ remove password
          const { password: _, ...result } = savedUser;

          this.kafka.emit('user-created',{
            email: userDto.email,
            timeStamp: new Date()
          }
          )

          return {
            status: true,
            message: "User registered successfully",
            data: result
          };
    }

    async Login(userLoginDto: UserLoginDto){
       
        const {email, password} = userLoginDto;

        // check user is exist or not
        const existingUser = await this.userRepository.findOne({
            where: {email}
        })

        if(!existingUser){
            throw new ConflictException("User not exist, please register")
        }

        // Matching password
        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

        if(!isPasswordMatch){
            throw new ConflictException("Invalid Password")
        }

        // Generate token
        const payload = {
            userId: existingUser.id,
            email: existingUser.email,
            role: existingUser.role
        }
        
        const token = this.jwtService.sign(payload);
        // console.log(token);

        this.kafka.emit('user-authenticated',{
            email: userLoginDto.email,
            timeStamp: new Date()
        })

        return {
            status: true,
            message: "Loggedin successfully",
        }
    }

    async GetUserByEmail(email: string){

        const cachedKey = `user:${email}`;

        // 1. Check cache
        const cachedUser = await this.redis.get(cachedKey);

        if (cachedUser) {
            // console.log('Cache HIT');
            return {
              status: true,
              message: 'User fetched from cache',
              data: JSON.parse(cachedUser),
            };
          }
        
        //   console.log('Cache MISS');

       // 2. Fetch user by email
       const user = await this.userRepository.findOne({
        where: {email}
       })
       
       if(!user){
        throw new NotFoundException("User not found")
       }

       const {password, ...result} = user;
    //    console.log('Cache Key', cachedKey);
  
       // 3. Store in cache (THIS IS WHERE)
        await this.redis.set(cachedKey, JSON.stringify(result),
        'EX', 600);
       return {
        status: true,
        message: "User successfully fetched",
        data: result
       }
    }

    async update(email: string, updateUserDto: UserUpdateDto){
        // 1. check the user in database
         const user = await this.userRepository.findOne({
            where: {email}
         })

         if(!user){
            throw new NotFoundException("User not found")
         }

        //2. update the user inside database
        Object.assign(user, updateUserDto);
        const updatedUser = await this.userRepository.save(user)

        //3. Cache Invalidation
        const cachedKey = `user:${email}`;
        await this.redis.del(cachedKey);
        console.log('Cache cleared',cachedKey);

        //4. Remove password
        const {password, ...result} = updatedUser;

        return {
            success: true,
            message: `${email} is successfully updated`,
            data: result
        }

    }

    async logout(token: string) {
        try {
            const decoded: any = this.jwtService.verify(token);
    
            const exp = decoded?.exp;
            const nowSeconds = Math.floor(Date.now() / 1000);
            const remainingSeconds = exp ? Math.max(1, exp - nowSeconds) : 300;
    
            const tokenHash = createHash('sha256').update(token).digest('hex');
            const blacklistKey = `jwt:blacklist:${tokenHash}`;
    
            await this.redis.set(blacklistKey, '1', 'EX', remainingSeconds);
    
            return { status: true, message: 'Logged out successfully' };
        } catch (error) {
            return { status: false, message: 'Invalid or expired token' };
        }
    }
}
