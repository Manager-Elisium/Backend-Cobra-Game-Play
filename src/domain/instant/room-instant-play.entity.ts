import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: "INSTANT_PLAY_ROOM" })
export class RoomInstantPlay extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", { name: "ID" })
  ID: string;

  @Column({ type: 'boolean', default: false })
  IS_GAME_FINISH: boolean;

  @Column({ default: 0 })
  CURRENT_ROUND_NUMBER: number;

  @Column({ default: 100 })
  ENTRY_FEES: number;

  @Column({ nullable: true })
  WIN_USER: string;

  @Column({ type: 'jsonb' })
  USERS: any;

  @Column({ type: 'jsonb', default: [] })
  USER_WIN_RANK: any;

  @Column({ type: 'jsonb', nullable: true })
  TURN_DECIDE_DECK: any;

  @Column({ nullable: true })
  CURRENT_TURN: string;

  @Column({ type: 'jsonb', nullable: true })
  GAME_DECK: any;

  @Column({ type: 'jsonb', default: [] })
  ROUND_INFO: any;

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
}



// Insert a new row with an array of JSON objects:
// const myEntity = new MyEntity();
// myEntity.data = [
//   { name: 'John', age: 30 },
//   { name: 'Jane', age: 25 }
// ];
// await myEntity.save();


// Retrieve all rows that contain a specific JSON object in the array:
// const entities = await MyEntity.find({ where: { data: { name: 'John', age: 30 } } });

// Update an existing row by appending a new JSON object to the array:
// const entity = await MyEntity.findOne(1); // Assuming the row with id=1 exists
// entity.data.push({ name: 'Alice', age: 35 });
// await entity.save();

// Delete a specific JSON object from the array:
// const entity = await MyEntity.findOne(1); // Assuming the row with id=1 exists
// entity.data = entity.data.filter(obj => obj.name !== 'John');
// await entity.save();

