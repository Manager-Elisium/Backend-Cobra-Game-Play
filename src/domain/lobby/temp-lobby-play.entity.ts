import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "LOBBY_GAME_PLAY" })
export class TempLobbyPlay extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { name: "ID" })
  ID: string;

  @Column()
  CONNECTION_ID: string;

  @Column()
  USER_ID: string;

  @Column({ default: 2 })
  NO_OF_PLAYER: number;

  @Column()
  LOBBY_ID: string;

  @Column()
  LOBBY_NAME: string;

  @Column()
  BUCKET_NAME: string;

  @Column()
  KEY: string

  @Column()
  ENTRY_FEE: number;

  @Column({ default: true })
  IS_LOBBY: boolean;

  @Column({ default: false })
  IS_CRITICAL: boolean;

  @Column({ default: false })
  IS_SINGLE_PLAYER: boolean;

  @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  CREATED_DATE: Date;

}