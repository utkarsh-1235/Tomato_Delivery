import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

console.log(process.env.EMAIL_USER)

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
    })

    async sendWelcomeEmail(to: string) {
        await this.transporter.sendMail({
          from: 'utkarsh.saxena13sept@gmail.com',
          to,
          subject: 'Welcome 🎉',
          html: `
           <h2>Welcome ${to}🎉</h2>
           <p>Your account is successfully created.</p>`
             
        });
    
        console.log('✅ Email sent to:', to);
      }
}
