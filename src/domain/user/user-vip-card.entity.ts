import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "USER_VIP_CARD" })
export class UserVipCard extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { name: "ID" })
  ID: string;

  @Column()
  USER_ID: string;

  @Column()
  VIP_CARD_ID: string;

  @Column()
  DAYS: string;

  @Column({ type: 'jsonb', default: [] })
  VIP_BENEFITS_ID: string;  

  @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  CREATED_DATE: Date;

  @Column('timestamp with time zone', { nullable: true })
  EXPIRY_DATE: Date;

  @Column('timestamp with time zone', { nullable: true })
  UPDATE_DATE: Date;

}