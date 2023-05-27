import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import Logger from '../util/Logger';

// noinspection JSUnusedGlobalSymbols
/**
 * The family command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Family implements Command
{
    name = 'family';
    description = 'Post our family tree';
    client: Client;
    logger = new Logger(Family.name);
    category: 'fun' = 'fun';

    /**
     * Creates a new family command
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
                .setTitle('The family tree:tm:')
                .addFields([
                    {
                        name: "\u200b",
                        value: `Wanna join the family? Just tell ${this.client.users.cache.get("443058373022318593")}, and we'll figure it out.`
                    }
                ])
                .setImage('https://files.soni.recalstudios.net/family.png')
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
