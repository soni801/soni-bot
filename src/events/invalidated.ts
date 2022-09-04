import { event } from '../types/events';
import Client from '../util/Client';

/**
 * The invalidated event
 *
 * @param {Client<true>} client The Client to use for the event
 * @returns {Promise<Client<true>>} The provided Client
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link ClientEvents.invalidated}
 */
const invalidated: event<'invalidated'> = async (client: Client<true>) =>
{
    client.logger.error('Lost connection to websocket, reconnecting...');
    await client.login().then(() => client.logger.info('Successfully reconnected'));

    return client;
};

export default invalidated;
