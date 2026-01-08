import { AppDataSource } from "src/libs/ormconfig";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert } from "typeorm"


@Entity({ name: "FRIEND_PLAY_ROOM" })
export class RoomFriendPlay extends BaseEntity {

    @PrimaryGeneratedColumn('uuid', { name: "ID" })
    ID: string;

    @Column({ unique: true })
    NAME: string;

    @Column({ type: 'boolean', default: false })
    IS_GAME_FINISH: boolean;

    @Column({ type: 'jsonb', default: [] })
    INVITE_USER: string[]

    @Column({ default: 0 })
    CURRENT_ROUND_NUMBER: number;

    @Column({ nullable: true })
    WIN_USER: string;

    @Column({ type: 'jsonb', default: []  })
    USERS: any;

    @Column({ type: 'jsonb', default: []  })
    ROUND_INFO: any;

    @Column({ type: 'jsonb', nullable: true })
    TURN_DECIDE_DECK: any;

    @Column({ nullable: true })
    CURRENT_TURN: string;

    @Column({ type: 'jsonb', nullable: true })
    GAME_DECK: any;

    @Column({ type: 'jsonb', default: [] })
    DROP_DECK: any;

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

    @Column({ type: 'jsonb', default: [] })
    USER_WIN_RANK: any;

    @BeforeInsert()
    async assignRoomSequence() {
        const entityManager = AppDataSource.getRepository(RoomFriendPlay);
        const sequenceQuery = "SELECT nextval('friend_room_sequence')";
        const result = await entityManager.query(sequenceQuery);
        const randomString = [...Array(4)].map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
        this.NAME = `${randomString}${result[0].nextval}`;
    }
}


// CREATE SEQUENCE IF NOT EXISTS public.friend_room_sequence
//     INCREMENT 1
//     START 1
//     MINVALUE 1
//     MAXVALUE 9223372036854775807
//     CACHE 1
//     OWNED BY "FRIEND_PLAY_ROOM"."NAME";