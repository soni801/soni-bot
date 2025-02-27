import {ChatInputCommandInteraction, Message, SlashCommandBuilder} from 'discord.js';
import { balls } from '../responses/balls.json';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

// noinspection JSUnusedGlobalSymbols
/**
 * The balls command
 *
 * @author Soni
 * @since 7.2.0
 * @see {@link Command}
 */
export default class Balls implements Command
{
    name = 'balls';
    description = 'Gives a balls cat gif';
    client: Client;
    logger = new Logger(Balls.name);
    category: 'fun' = 'fun';

    /**
     * Creates a new balls command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author Soni
     * @since 7.2.0
     * @see {@link Client}
     */
    constructor(client: Client)
    {
        this.client = client;
    }

    /**
     * Executes the command
     *
     * @param {ChatInputCommandInteraction<"cached">} i The command interaction
     * @returns {Promise<Message<boolean>>} The reply sent by the bot
     *
     * @author Soni
     * @since 7.2.0
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>): Promise<Message>
    {
        // Generate a random balls index
        const balls_index = this.client.randomNumber(0, balls.length);

        return await i.editReply({ content: balls[balls_index], embeds: [] });
    }

    /**
     * The slash command builder for this command interaction.
     *
     * @returns {Promise<SlashCommandBuilder>} The slash command builder for this command interaction.
     */
    async slashCommand(): Promise<SlashCommandBuilder>
    {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }
}
