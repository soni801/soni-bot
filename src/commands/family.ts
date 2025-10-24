import {Command} from "../types/Command";
import Client from "../util/Client";
import Logger from "../util/Logger";
import {ChatInputCommandInteraction, Message, SlashCommandBuilder} from "discord.js";

/**
 * The family command
 *
 * @author Soni
 * @since 7.3.0
 * @see {@link Command}
 */
export default class Family implements Command
{
    name = 'family';
    description = 'Post the family tree';
    client: Client;
    logger = new Logger(Family.name);
    category: 'fun' = 'fun';

    /**
     * Creates a new family command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author Soni
     * @since 7.3.0
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
     * @since 7.3.0
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>): Promise<Message>
    {
        // Use current time as parameter for the image to avoid Discord caching
        const seed = new Date().getTime();

        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('The family tree:tm:')
                .setImage(`https://files.soni.recalstudios.net/family.png?${seed}`)
        ] });
    }

    /**
     * The slash command builder for this command interaction
     *
     * @returns {Promise<SlashCommandBuilder>} The slash command builder for this command interaction
     */
    async slashCommand(): Promise<SlashCommandBuilder>
    {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}
