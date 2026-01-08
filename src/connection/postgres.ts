import { error, info } from "./../common/logger";
import { AppDataSource } from "../libs/ormconfig";


async function connectToDatabase(): Promise<Boolean> {
    try {
        let connection = await AppDataSource.initialize();
        info('Database Connection Established Successfully...');
        return connection.isInitialized;
    } catch (errors: any) {
        error('Failed to connect to database:', errors);
        return false;
    }
}

export { connectToDatabase };