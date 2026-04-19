import { Controller } from '@nestjs/common';
import { EmailService } from './email.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()   // 3002/email
export class EmailController {
    constructor(private emailService: EmailService){}

    @EventPattern('user-created')
    async handleUserCreated(@Payload() message: any){

      try{
        console.log("Event recieved", message)

        return this.emailService.sendWelcomeEmail(message.email);
      }
      catch(err){
        throw new Error(err.message);
      }
        // const data = JSON.parse(message.value);
        
    }

    @EventPattern('user-authenticated')
    async handleLogin(@Payload() message: any) {
      try{
        return this.emailService.sendWelcomeEmail(message.email);
      }
      catch(err){
         throw new Error(err.message)
      }
      // const data = JSON.parse(message.value);
  
      // console.log('📊 User logged in:', data.email);
     
    }
}
