import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import Logger from '../util/Logger';

/**
 * The ping command
 *
 * @author Soni
 * @since 1.0.0
 * @see {@link Command}
 */
export default class Ping implements Command
{
    name = 'ping';
    description = 'Tests the ping of the bot'
    client: Client;
    logger = new Logger(Ping.name);

    /**
     * Creates a new ping command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author Soni
     * @since 1.0.0
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
     * @since 1.0.0
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>)
    {
        // Send a message
        await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle(':ping_pong: Testing ping')
                .setDescription('Waiting...')
        ] });

        // Fetch the message, and check the latency
        const message = await i.fetchReply();
        return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setTitle(':ping_pong: Pong!')
                    .setDescription(`Bot latency (RTT): ${message.createdTimestamp - i.createdTimestamp}ms
                    API latency: ${Math.round(this.client.ws.ping)}ms`)
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
