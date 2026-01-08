// import 'source-map-support/register';
import './module-alias';

import http from 'http';
import { createApp } from './app';
import { connectToDatabase } from './connection/postgres';
import { error, info, warning } from './common/logger';
import { setupSocket } from './libs/socket-config';

const SERVER_SHUTDOWN_TIMEOUT_MS = 10_000;

/**
 * Helper function to log an exit code before exiting the process.
 */
const logAndExitProcess = (exitCode: number) => {
    error(
        'Exiting process',
        {
            exit_code_number: exitCode
        },
    );
    process.exit(exitCode);
};

/**
 * Returns a promise that attempts to shut an http server down,
 * resolving if it succeeded and rejecting if it failed or timed out.
 */
const shutdownServerWithTimeout = async (server: http.Server): Promise<unknown> =>
    Promise.race([
        // P.fromCallback((cb) => server.close(cb)),
        new Promise((resolve, reject) =>
            setTimeout(() => reject(Error('Timeout shutting server')), SERVER_SHUTDOWN_TIMEOUT_MS)
        )
    ]);

/**
 * Helper function to setup signal handlers on the process to gracefully
 * shutdown the server.
 */
const setupSignalHandlers = (server: http.Server) => {
    process.on('SIGTERM', async () => {
        info('Received signal: SIGTERM');
        try {
            await shutdownServerWithTimeout(server);
            logAndExitProcess(0);
        } catch (err) {
            error(err, 'Failed to shutdown server');
            logAndExitProcess(1);
        }
    });
    process.on('SIGINT', async () => {
        info('Received signal: SIGINT');
        try {
            await shutdownServerWithTimeout(server);
            logAndExitProcess(0);
        } catch (err) {
            error(err, 'Failed to shutdown server');
            logAndExitProcess(1);
        }
    });
};

/**
 * Sets up event listeners on unexpected errors and warnings. These should theoretically
 * never happen. If they do, we assume that the app is in a bad state. For errors, we
 * exit the process with code 1.
 */
const setupProcessEventListeners = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process.on('unhandledRejection', (reason: any) => {
        warning('encountered unhandled rejection', { reason_object: reason });
        logAndExitProcess(1);
    });

    process.on('uncaughtException', (err: Error) => {
        error(err.toString(), 'encountered uncaught exception');
        logAndExitProcess(1);
    });

    process.on('warning', (err: Error) => {
        warning(
            'encountered warning',
            {
                warning_object: err
            }
        );
    });
};

/**
 * Start an Express server and installs signal handlers on the
 * process for graceful shutdown.
 */
(async () => {
    try {
        const app = await createApp();
        // Create the HTTP server
        const httpServer = http.createServer(app);
        const socket = await setupSocket(httpServer);
        const server = httpServer.listen(app.get('port'), () => {
            info(
                'Started express server',
                {
                    port_number: app.get('port'),
                    env_string: app.get('env')
                }
            );
        });
        setupSignalHandlers(server);
        setupProcessEventListeners();

        const connectDB = await connectToDatabase();

        if (!connectDB) {
            process.exit(0)
        }
    } catch (err) {
        error(err, 'error caught in server.ts');
    }
})();





