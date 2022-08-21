import { GatewayIntentBits } from 'discord-api-types/v10';
import { ClientOptions, ColorResolvable, User } from 'discord.js';
import './dotenv';

/**
 * The token used by the Client to log in to the Discord API
 *
 * @since 1.0.0
 */
export const token = process.env.TOKEN;

/**
 * The colors used by the bot for embeds
 *
 * @type {{default: string, success: string, warning: string, error: string}}
 * @since 1.0.0
 * @see {@link ColorResolvable}
 */
const COLORS: { [ key: string ]: ColorResolvable } = {
    default: 'Blurple',
    success: 'Green',
    warning: 'Orange',
    error: 'Red'
};

/**
 * Constant values set at runtime
 *
 * @type {{COLORS: {[p: string]: ColorResolvable}, ERRORS: {DEPLOY_FAILED: string, DISABLED: string, BOT_MISSING_PERMS: string, GENERIC: string, NOT_IMPLEMENTED_NOT_EXIST: string, DB_NOT_CONNECTED: string, UNKNOWN_SUBCOMMAND: string, CLIENT_DESTROY: string, COMMAND_RUN_ERROR: string, USER_MISSING_PERMS: string, SHUTDOWN_USED: (user: User) => string}, logLevel: string}}
 * @since 1.0.0
 */
export const CONSTANTS = {
    ERRORS: {
        GENERIC: 'An error has occurred.',
        DEPLOY_FAILED: 'Failed to deploy!',
        CLIENT_DESTROY: 'Client destroyed, exiting process...',
        SHUTDOWN_USED: (user: User) => `Shutdown command used by ${user.tag} on ${new Date()}`,
        COMMAND_RUN_ERROR: 'An error occurred while running the command, please try again later or contact the bot owner if the problem persists.',
        DISABLED: ':lock: This command has been disabled.',
        BOT_MISSING_PERMS: ':x: The command could not be preformed because one or more permissions are missing.',
        USER_MISSING_PERMS: ':lock: You do not have permission to use this command.',
        DB_NOT_CONNECTED: ':x: Database not connected, try again later.',
        UNKNOWN_SUBCOMMAND: ':x: Unknown subcommand.',
        NOT_IMPLEMENTED_NOT_EXIST: ':x: Not implemented or doesn\'t exist'
    },
    COLORS,
    logLevel: process.env.LOG_LEVEL || 'debug'
};

/**
 * The ClientOptions used by the Client when logging in
 *
 * @type {{intents: (GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages)[], allowedMentions: {parse: (string)[]}}}
 * @since 1.0.0
 * @see {@link ClientOptions}
 */
export const CLIENT_OPTIONS: ClientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
    allowedMentions: {
        parse: [ 'users', 'roles' ]
    }
}
