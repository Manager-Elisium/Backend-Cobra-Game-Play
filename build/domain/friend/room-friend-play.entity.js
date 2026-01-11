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
var RoomFriendPlay_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomFriendPlay = void 0;
const ormconfig_1 = require("src/libs/ormconfig");
const typeorm_1 = require("typeorm");
let RoomFriendPlay = RoomFriendPlay_1 = class RoomFriendPlay extends typeorm_1.BaseEntity {
    async assignRoomSequence() {
        const entityManager = ormconfig_1.AppDataSource.getRepository(RoomFriendPlay_1);
        const sequenceQuery = "SELECT nextval('friend_room_sequence')";
        const result = await entityManager.query(sequenceQuery);
        const randomString = [...Array(4)].map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
        this.NAME = `${randomString}${result[0].nextval}`;
    }
};
exports.RoomFriendPlay = RoomFriendPlay;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: "ID" }),
    __metadata("design:type", String)
], RoomFriendPlay.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], RoomFriendPlay.prototype, "NAME", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RoomFriendPlay.prototype, "IS_GAME_FINISH", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], RoomFriendPlay.prototype, "INVITE_USER", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RoomFriendPlay.prototype, "CURRENT_ROUND_NUMBER", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoomFriendPlay.prototype, "WIN_USER", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "USERS", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "ROUND_INFO", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "TURN_DECIDE_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoomFriendPlay.prototype, "CURRENT_TURN", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "GAME_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "DROP_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "CURRENT_DROP_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "PREVIOUS_DROP_DECK", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], RoomFriendPlay.prototype, "CREATED_DATE", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: true }),
    __metadata("design:type", Date)
], RoomFriendPlay.prototype, "UPDATED_DATE", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: true }),
    __metadata("design:type", Date)
], RoomFriendPlay.prototype, "GAME_FINISH_DATE", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], RoomFriendPlay.prototype, "USER_WIN_RANK", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoomFriendPlay.prototype, "assignRoomSequence", null);
exports.RoomFriendPlay = RoomFriendPlay = RoomFriendPlay_1 = __decorate([
    (0, typeorm_1.Entity)({ name: "FRIEND_PLAY_ROOM" })
], RoomFriendPlay);
// CREATE SEQUENCE IF NOT EXISTS public.friend_room_sequence
//     INCREMENT 1
//     START 1
//     MINVALUE 1
//     MAXVALUE 9223372036854775807
//     CACHE 1
//     OWNED BY "FRIEND_PLAY_ROOM"."NAME";
