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
exports.LobbyInstantPlay = void 0;
const typeorm_1 = require("typeorm");
let LobbyInstantPlay = class LobbyInstantPlay extends typeorm_1.BaseEntity {
};
exports.LobbyInstantPlay = LobbyInstantPlay;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid", { name: "ID" }),
    __metadata("design:type", String)
], LobbyInstantPlay.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LobbyInstantPlay.prototype, "CONNECTION_ID", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LobbyInstantPlay.prototype, "USER_ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LobbyInstantPlay.prototype, "IS_LOBBY", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LobbyInstantPlay.prototype, "IS_SINGLE_PLAYER", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], LobbyInstantPlay.prototype, "CREATED_DATE", void 0);
exports.LobbyInstantPlay = LobbyInstantPlay = __decorate([
    (0, typeorm_1.Entity)({ name: "INSTANT_PLAY_LOBBY" })
], LobbyInstantPlay);
