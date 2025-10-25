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
        const seed = Math.floor(new Date().getTime() / 1000 / 120); // Change value every 2 minutes

        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('The family tree:tm:')
                .addFields([
                    {
                        name: '\u200B',
                        value: '-# Not loading? [Open in browser](https://files.soni.recalstudios.net/family.png)'
                    }
                ])
                .setImage(`https://files.soni.recalstudios.net/family.png?ts=${seed}`)
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
