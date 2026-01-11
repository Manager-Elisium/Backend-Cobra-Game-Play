"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const logger_1 = require("./../common/logger");
const ormconfig_1 = require("../libs/ormconfig");
async function connectToDatabase() {
    try {
        let connection = await ormconfig_1.AppDataSource.initialize();
        (0, logger_1.info)('Database Connection Established Successfully...');
        return connection.isInitialized;
    }
    catch (errors) {
        (0, logger_1.error)('Failed to connect to database:', errors);
        return false;
    }
}
