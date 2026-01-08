import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "BUG_REPORT" })
export class BugReport extends BaseEntity {
    @PrimaryGeneratedColumn("uuid", { name: "ID" })
    ID: string;

    @Column()
    USER_ID: string;

    @Column()
    SUBJECT: string;

    @Column()
    DESCRPTION: string;

    @Column({ nullable: true })
    REPLY: string;

    @Column({ type: 'jsonb', default: [] })
    BUG_FILES: any;

    @Column({ type: 'boolean', default: false })
    IS_BUG_RESOLVED: boolean;

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    CREATED_DATE: Date;

    @Column('timestamp with time zone', { nullable: true })
    UPDATE_DATE: Date;

}