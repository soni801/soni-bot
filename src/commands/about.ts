import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import Logger from '../util/Logger';

/**
 * The about command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class About implements Command
{
    name = 'about';
    description = 'Show info about Soni Bot';
    client: Client;
    logger = new Logger(About.name);

    /**
     * Creates a new about command
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
                .setTitle('About Soni Bot')
                .addFields([
                    {
                        name: "What am I?",
                        value: `I am a lightweight toolkit bot developed by ${this.client.users.cache.get("443058373022318593")}. I was originally just meant for fun inside jokes, but my functionality has since expanded to include things like moderation and utility.`,
                        inline: true
                    },
                    {
                        name: "How do I function?",
                        value: "There is more details about each command in the /help command, and every command has autofill. The code is also open source and available [on GitHub](https://github.com/soni801/soni-bot/).",
                        inline: true
                    }
                ])
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
