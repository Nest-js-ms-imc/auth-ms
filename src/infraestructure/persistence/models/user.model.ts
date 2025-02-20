import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { IUserModel } from 'src/application/persistence/models/user.model';

@Entity()
export class UserModel implements IUserModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text')
  password: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('date', {
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('date', { nullable: true })
  updatedAt: Date | null;

  @Column('date', { nullable: true })
  deletedAt: Date | null;
}
