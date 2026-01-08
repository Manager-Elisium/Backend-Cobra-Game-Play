import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "INSTANT_PLAY_LOBBY" })
export class LobbyInstantPlay extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { name: "ID" })
  ID: string;

  @Column()
  CONNECTION_ID: string;

  @Column()
  USER_ID: string;

  @Column({ default: true })
  IS_LOBBY: boolean;

  @Column({ default: false })
  IS_SINGLE_PLAYER: boolean;

  @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  CREATED_DATE: Date;

}