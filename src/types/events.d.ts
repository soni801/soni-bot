import type { Awaitable, ClientEvents } from 'discord.js';
import Client from '../util/Client';

/**
 * Decorates a function as an event
 *
 * @param {Client} client The Client
 * @returns Awaitable<any> The event that is being decorated
 *
 * @author theS1LV3R
 * @since 6.0.0
 * @see {@link ClientEvents}
 */
export type event<K extends keyof ClientEvents> = (client: Client<true>, ...arg: ClientEvents[K]) => Awaitable<any>;
