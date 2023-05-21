import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { event } from '../types/events';
import Client from '../util/Client';

/**
 * The messageReactionAdd event
 *
 * @param {Client<true>} client The Client to use for the event
 * @param {MessageReaction | PartialMessageReaction} r The reaction that was created
 * @param {User | PartialUser} u The user that reacted
 * @returns {Promise<undefined | boolean>} Whether a user's roles were updated
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link ClientEvents.messageReactionAdd}
 * @see {@link Client.handleReaction}
 */
const messageReactionAdd: event<'messageReactionAdd'> = async (client: Client<true>, r: MessageReaction | PartialMessageReaction, u: User | PartialUser) =>
{
    return client.handleReaction(r, u, true);
};

// noinspection JSUnusedGlobalSymbols
export default messageReactionAdd;
