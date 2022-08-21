import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import Client from '../util/Client';
import Logger from '../util/Logger';

/**
 * A slash command
 *
 * @author theS1LV3R
 * @since 6.0.0
 * @see {@link ChatInputCommandInteraction}
 */
export abstract class Command
{
    /**
     * The client that this interaction is attached to
     *
     * @type {Client}
     */
    client: Client;

    /**
     * The logger for this command interaction
     *
     * @type {Logger}
     */
    logger: Logger;

    /**
     * The name of the command interaction
     *
     * @type {string}
     */
    name: string;

    /**
     * Creates a new Command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link Client}
     */
    constructor(client: Client);

    /**
     * The slash command builder for this command interaction.
     *
     * @returns {Promise<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandGroupBuilder>} The slash command builder for this command interaction.
     *
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link SlashCommandBuilder}
     * @see {@link SlashCommandSubcommandsOnlyBuilder}
     * @see {@link SlashCommandSubcommandGroupBuilder}
     */
    abstract slashCommand(): Promise<
        | SlashCommandBuilder
        | SlashCommandSubcommandsOnlyBuilder
        | SlashCommandSubcommandGroupBuilder
        >;

    /**
     * The entry point for this command interaction.
     *
     * @param {ChatInputCommandInteraction<"cached">} i The interaction object.
     * @returns {Promise<any>} The entry point for this interaction
     * 
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link ChatInputCommandInteraction}
     */
    abstract execute(i: ChatInputCommandInteraction<'cached'>): Promise<any>;
}
