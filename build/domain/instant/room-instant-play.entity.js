"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomInstantPlay = void 0;
const typeorm_1 = require("typeorm");
let RoomInstantPlay = class RoomInstantPlay extends typeorm_1.BaseEntity {
};
exports.RoomInstantPlay = RoomInstantPlay;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid", { name: "ID" }),
    __metadata("design:type", String)
], RoomInstantPlay.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RoomInstantPlay.prototype, "IS_GAME_FINISH", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RoomInstantPlay.prototype, "CURRENT_ROUND_NUMBER", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], RoomInstantPlay.prototype, "ENTRY_FEES", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoomInstantPlay.prototype, "WIN_USER", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "USERS", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "USER_WIN_RANK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "TURN_DECIDE_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoomInstantPlay.prototype, "CURRENT_TURN", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "GAME_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "ROUND_INFO", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "DROP_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "CURRENT_DROP_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomInstantPlay.prototype, "PREVIOUS_DROP_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RoomInstantPlay.prototype, "CREATED_DATE", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: true }),
    __metadata("design:type", Date)
], RoomInstantPlay.prototype, "UPDATED_DATE", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: true }),
    __metadata("design:type", Date)
], RoomInstantPlay.prototype, "GAME_FINISH_DATE", void 0);
exports.RoomInstantPlay = RoomInstantPlay = __decorate([
    (0, typeorm_1.Entity)({ name: "INSTANT_PLAY_ROOM" })
], RoomInstantPlay);
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
