import {event} from '../types/events';
import Client from '../util/Client';
import {ActivityType} from "discord-api-types/v10";

/**
 * The ready event
 *
 * @param {Client<true>} client The Client to use for the event
 * @returns {Promise<Client<true>>} The provided Client
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link ClientEvents.ready}
 */
const ready: event<'ready'> = async (client: Client<true>) =>
{
    // Deploy the application's slash commands
    await client.deployCommands().catch((e: Error) =>
    {
        client.logger.error(`An error occurred while deploying commands: ${e.message}`);
        console.error(e);
        throw e;
    });

    // Set the bot activity
    client.user.setActivity('/help', { type: ActivityType.Listening })

    client.logger.verbose(`Loaded ${client.guilds.cache.size} guild(s)`);
    client.logger.verbose(`Loaded ${client.commands.size} command(s)`);
    client.logger.info(`Logged in as ${client.user?.tag} with Soni Bot version ${client.version}`);

    return client;
};

// noinspection JSUnusedGlobalSymbols
export default ready;
