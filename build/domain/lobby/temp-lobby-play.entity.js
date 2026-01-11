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
exports.TempLobbyPlay = void 0;
const typeorm_1 = require("typeorm");
let TempLobbyPlay = class TempLobbyPlay extends typeorm_1.BaseEntity {
};
exports.TempLobbyPlay = TempLobbyPlay;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid", { name: "ID" }),
    __metadata("design:type", String)
], TempLobbyPlay.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TempLobbyPlay.prototype, "CONNECTION_ID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TempLobbyPlay.prototype, "USER_ID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TempLobbyPlay.prototype, "NO_OF_PLAYER", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TempLobbyPlay.prototype, "LOBBY_ID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TempLobbyPlay.prototype, "LOBBY_NAME", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TempLobbyPlay.prototype, "BUCKET_NAME", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TempLobbyPlay.prototype, "KEY", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TempLobbyPlay.prototype, "ENTRY_FEE", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], TempLobbyPlay.prototype, "IS_LOBBY", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TempLobbyPlay.prototype, "IS_CRITICAL", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TempLobbyPlay.prototype, "IS_SINGLE_PLAYER", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], TempLobbyPlay.prototype, "CREATED_DATE", void 0);
exports.TempLobbyPlay = TempLobbyPlay = __decorate([
    (0, typeorm_1.Entity)({ name: "LOBBY_GAME_PLAY" })
], TempLobbyPlay);
