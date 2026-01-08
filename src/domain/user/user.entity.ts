import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "USER_RECORD" })
export class UserRecord extends BaseEntity {
    @PrimaryGeneratedColumn("uuid", { name: "ID" })
    ID: string;

    @Column()
    USER_ID: string;

    // Not Deduction
    @Column({ default: 500 })
    TOTAL_DIAMOND: number;

    // Not Deduction
    @Column({ default: 5000 })
    TOTAL_COIN: number;

    // Add Daily Reward, VIP_CARD Reward and Shop Diamond 
    @Column({ default: 500 })
    CURRENT_DIAMOND: number;

    // Deduction on Play, Add Daily Reward, VIP_CARD Reward and Shop Coin 
    @Column({ default: 5000 })
    CURRENT_COIN: number;

    // Add Only Win Game
    @Column({ default: 0 })
    WIN_COIN: number;

    // Add Only Win Game
    @Column({ default: 0 })
    WIN_DIAMOND: number;

    @Column({ default: 0 })
    XP: number;

    @Column({ default: 1 })
    LEVEL: number;
    
    @Column({ default: 0 })
    TOTAL_PLAYED_GAME: number;

    @Column({ default: 0 })
    TOTAL_WIN_GAME: number;

    @Column({ default: 0 })
    TOTAL_ROUND_WIN: number;

    @Column({ default: 0 })
    WINNING_STREAK: number;

    // Season
    @Column({ default: 0 })
    CURRENT_SEASON_WIN_GAMES: number;

    @Column({ default: 0 })
    CURRENT_SEASON_WIN_ROUNDS: number;

    @Column({ default: 0 })
    CURRENT_SEASON_WIN_COIN: number;

    @Column({ type: 'boolean', default: false })
    IS_BUY_ROYAL_PASS: boolean; // For Current Season

    @Column({ type: 'jsonb', default: [] })
    CURRENT_SEASON_REWARDS_COLLECTED: any;

    @Column({ default: 0 })
    CURRENT_SEASON_XP: number;

    @Column({ default: 1 })
    CURRENT_SEASON_LEVEL: number;

    @Column({ default: 0 })
    CURRENT_SEASON_COLLECTED_DIAMOND: number;


    // Item
    @Column({ type: 'jsonb', default: [] })
    EMOJI_ITEMS: any;
    
    @Column({ type: 'jsonb', default: [] })
    AVATAR_ITEMS: any;

    @Column({ type: 'jsonb', default: [] })
    FRAME_ITEMS: any;

    @Column({ type: 'jsonb', default: [] })
    TABLE_ITEMS: any;

    @Column({ type: 'jsonb', default: [] })
    CARD_ITEMS: any;



    // Achivement
    @Column({ type: 'jsonb', default: [] })
    ACHIVEMENTS: any;

    // Badge
    @Column({ type: 'jsonb', default: [] })
    BADGES: any;

    // Daily Reward
    @Column({ type: 'jsonb', default: [] })
    DAILY_REWARD: any;

    // Mission Reward
    @Column({ type: 'jsonb', default: [] })
    MISSION_REWARD: any;



    @Column({ type: 'boolean', default: false })
    IS_SHOW_VIP_CARD: boolean;

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    CREATED_DATE: Date;

    @Column('timestamp with time zone', { nullable: true })
    UPDATE_DATE: Date;

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    LAST_LOGIN_DATE: Date;

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    CREATE_DAILY_REWARD_DATE: Date;



    // Send Receive Coin
    @Column({ type: 'jsonb', default: [] })
    SEND_RECEIVE_COIN: any;

}


// 2023-08-03 12:30:16.547201+00