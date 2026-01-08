import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "GIFT_COLLECT" })
export class GiftCollect extends BaseEntity {
    @PrimaryGeneratedColumn("uuid", { name: "ID" })
    ID: string;

    @Column()
    USER_ID: string;

    @Column()
    REQUEST_USER_ID: string;

    @Column()
    COIN: number;

    @Column({ type: 'boolean', default: false })
    IS_COLLECT: boolean;

    @Column({ type: 'boolean', default: false })
    IS_REQ_AND_SEND: boolean;

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    CREATED_DATE: Date;

    @Column('timestamp with time zone', { nullable: true })
    UPDATE_DATE: Date;

}