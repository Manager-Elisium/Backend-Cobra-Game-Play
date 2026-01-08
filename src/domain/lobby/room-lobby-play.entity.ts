import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "LOBBY_PLAY_ROOM" })
export class RoomLobbyPlay extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { name: "ID" })
  ID: string;

  @Column({ type: 'boolean', default: false })
  IS_GAME_FINISH: boolean;

  @Column({ default: 0 })
  CURRENT_ROUND_NUMBER: number;

  @Column()
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
  ENTRY_FEES: number;

  @Column({ nullable: true })
  WIN_USER: string;

  @Column({ type: 'jsonb' })
  USERS: any;

  @Column({ type: 'jsonb', nullable: true })
  TURN_DECIDE_DECK: any;

  @Column({ type: 'jsonb', default: []  })
  ROUND_INFO: any;

  @Column({ nullable: true })
  CURRENT_TURN: string;

  @Column({ type: 'jsonb', nullable: true })
  GAME_DECK: any;

  @Column({ type: 'jsonb', default: [] })
  DROP_DECK: any;

  @Column({ type: 'jsonb', default: [] })
  USER_WIN_RANK: any;

  @Column({ type: 'jsonb', default: [] })
  CURRENT_DROP_DECK: any;

  @Column({ type: 'jsonb', default: [] })
  PREVIOUS_DROP_DECK: any;

  @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  CREATED_DATE: Date;

  @Column('timestamp with time zone', { nullable: true })
  UPDATED_DATE: Date;

  @Column('timestamp with time zone', { nullable: true })
  GAME_FINISH_DATE: Date;
}