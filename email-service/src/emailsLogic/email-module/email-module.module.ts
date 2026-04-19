import { Module } from '@nestjs/common';
import { EmailController } from '../email/email.controller';
import { EmailService } from '../email/email.service';

@Module({
    imports: [],
    controllers: [EmailController],
    providers: [EmailService],

})
export class EmailModuleModule {}
