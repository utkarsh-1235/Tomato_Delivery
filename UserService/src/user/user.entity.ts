import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './Role';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
 
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: Role.User })
  role: Role;
}