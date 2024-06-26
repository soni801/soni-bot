import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { event } from '../types/events';
import Client from '../util/Client';

/**
 * The messageReactionRemove event
 *
 * @param {Client<true>} client The Client to use for the event
 * @param {MessageReaction | PartialMessageReaction} r The reaction that was removed
 * @param {User | PartialUser} u The user that removed the reaction
 * @returns {Promise<undefined | boolean>} Whether a user's roles were updated
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link ClientEvents.messageReactionRemove}
 * @see {@link Client.handleReaction}
 */
const messageReactionRemove: event<'messageReactionRemove'> = async (client: Client<true>, r: MessageReaction | PartialMessageReaction, u: User | PartialUser): Promise<undefined | boolean> =>
{
    return client.handleReaction(r, u, false);
};

// noinspection JSUnusedGlobalSymbols
export default messageReactionRemove;
