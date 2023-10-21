import Client from './util/Client';
import { CLIENT_OPTIONS, token } from './util/config';
import Logger from './util/Logger';

let client: Client;
const logger = new Logger('main');

/**
 * Starts the bot by creating a new Client and logging in with the provided token and options.
 *
 * @author theS1LV3R
 * @since 6.0.0
 */
function start()
{
    // Create a new Client and log in
    client = new Client(CLIENT_OPTIONS);
    client.login(token).catch((e: Error) =>
    {
        logger.warn(`An error occurred while logging into the client: ${e.message}`);
        console.error(e);
        die();
    });

    // Restart the bot upon receiving the restart event
    client.on('restart', async () =>
    {
        client.logger.info('Restarting...');
        client.destroy().then(() => start());
    });
}

// Run the start function
start();

/**
 * Exits the bot safely.
 *
 * @param {string} arg The signal received
 *
 * @author theS1LV3R
 * @since 6.0.0
 * @see {@link https://en.wikipedia.org/wiki/Signal_(IPC)|IPC signals}
 */
function exit(...arg: string[])
{
    // Log the signal
    client.logger.warn(`${arg} received, exiting...`);

    // Safely destroy the client
    client.destroy().then(() => client.logger.info('Destroyed client'));
}

/**
 * Kills the bot
 *
 * @author theS1LV3R
 * @since 6.0.0
 * @see {@link exit}
 */
const die = exit;

// Register callbacks for IPC signals
process.on('SIGTERM', exit);
process.on('SIGQUIT', exit);
process.on('SIGINT', exit);
process.on('exit', exit);
