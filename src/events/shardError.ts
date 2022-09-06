import { event } from '../types/events';
import Client from '../util/Client';

/**
 * The shardError event
 *
 * @param {Client<true>} client The Client to use for the event
 * @param {Error} error The error that is received
 * @returns {Promise<Client<true>>} The provided Client
 *
 * @author Soni
 * @since 6.2.2
 * @see {@link ClientEvents.shardError}
 */
const shardError: event<'shardError'> = async (client: Client<true>, error: Error) =>
{
    console.error('A websocket connection encountered an error:', error);

    client.logger.error('Lost connection to websocket, reconnecting...');
    await client.login().then(() => client.logger.info('Successfully reconnected'));

    return client;
};

export default shardError;
