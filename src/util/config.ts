import { ClientOptions, ColorResolvable, GatewayIntentBits, Partials } from 'discord.js';
import './dotenv';

/**
 * The token used by the Client to log in to the Discord API
 *
 * @since 6.0.0
 */
export const token = process.env.TOKEN;

/**
 * The colors used by the bot for embeds
 *
 * @type {{default: string, success: string, warning: string, error: string}}
 * @since 6.0.0
 * @see {@link ColorResolvable}
 */
const COLORS: { [ key: string ]: ColorResolvable } = {
    default: 0x3ba3a1,
    success: 0x72e85a,
    warning: 0xe88e5a,
    error: 0xe8655a
};

/**
 * Constant values set at runtime
 *
 * @type {any}
 * @since 6.0.0
 */
export const CONSTANTS: any = {
    ERRORS: {
        GENERIC: 'An error has occurred.',
        DEPLOY_FAILED: 'Failed to deploy!',
        CLIENT_DESTROY: 'Client destroyed, exiting process...',
        DISABLED: ':lock: This command has been disabled.',
        BOT_MISSING_PERMS: ':x: The command could not be preformed because one or more permissions are missing.',
        USER_MISSING_PERMS: ':lock: You do not have permission to use this command.',
        DB_NOT_CONNECTED: ':x: Database not connected, try again later.',
        UNKNOWN_SUBCOMMAND: ':x: Unknown subcommand.',
        NOT_IMPLEMENTED_NOT_EXIST: ':x: Not implemented or doesn\'t exist',
        AUTOCOMPLETE_NOT_EXIST: 'This autocomplete interaction does not exist'
    },
    COLORS,
    logLevel: process.env.LOG_LEVEL || 'debug'
};

/**
 * The ClientOptions used by the Client when logging in
 *
 * @since 6.0.0
 * @see {@link ClientOptions}
 */
export const CLIENT_OPTIONS: ClientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Reaction
    ],
    allowedMentions: {
        parse: [
            'users',
            'roles'
        ]
    }
}
