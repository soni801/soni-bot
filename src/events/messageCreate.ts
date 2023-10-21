import { Message, TextChannel } from 'discord.js';
import { event } from '../types/events';
import Client from '../util/Client';

/**
 * The messageCreate event
 *
 * @param {Client<true>} client The Client to use for the event
 * @param {Message} m The Message that was created
 * @returns {Promise<Message<boolean>>} The provided Message
 *
 * @author Soni
 * @since 6.0.1
 * @see {@link ClientEvents.messageCreate}
 * @see {@link react}
 */
const messageCreate: event<'messageCreate'> = async (client: Client<true>, m: Message): Promise<Message> =>
{
    react(client, m, 'ew', '808988372948615178');
    react(client, m, 'dbrug', '808989500058894376');

    return m;
};

/**
 * Reacts to a given message if it includes a set phrase
 *
 * @param {Client<true>} client The Client to use for the reaction
 * @param {Message} message The message to react to
 * @param {string} phrase The phrase to search for
 * @param {string} emoteID The emote to react with
 *
 * @author Soni
 * @since 6.0.1
 */
function react(client: Client<true>, message: Message, phrase: string, emoteID: string)
{
    // Make sure the message happened in a guild
    if (!message.inGuild()) return;

    // Check if the message includes the provided phrase
    if (!message.content.toLowerCase().startsWith(phrase) &&
        !message.content.toLowerCase().includes(" " + phrase) &&
        !message.content.toLowerCase().includes(":" + phrase))
        return;

    // Fetch the channel
    const channel = client.channels.cache.get(message.channelId);
    if (!(channel instanceof TextChannel)) return;

    // Fetch the guild
    const guild = client.guilds.cache.get(message.guildId);
    if (guild === undefined) return;

    // Fetch the emote
    const emote = client.emojis.cache.get(emoteID);
    if (emote === undefined) return client.logger.error(`Failed to react with emote ${emote} to phrase '${phrase}' in #${channel.name}, ${guild.name} because it doesn't exist`);

    // React with the emote
    message.react(emote).then(() => client.logger.info(`Reacted with emote ${emote} to phrase '${phrase}' in #${channel.name}, ${guild.name}`));
}

// noinspection JSUnusedGlobalSymbols
export default messageCreate;
