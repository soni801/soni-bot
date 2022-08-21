import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import Logger from '../util/Logger';

/**
 * The svensdum command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Svensdum implements Command
{
    name = 'svensdum';
    description = 'Kinda self explanatory innit';
    client: Client;
    logger = new Logger(Svensdum.name);
    category: 'fun' = 'fun';

    /**
     * Creates a new svensdum command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author Soni
     * @since 6.0.0
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
     * @since 6.0.0
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>)
    {
        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('Sven\'s dum')
                .setImage('https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png')
        ] });
    }

    /**
     * The slash command builder for this command interaction.
     *
     * @returns {Promise<SlashCommandBuilder>} The slash command builder for this command interaction.
     */
    async slashCommand()
    {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}
