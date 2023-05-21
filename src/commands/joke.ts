import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { jokes } from '../responses/joke.json';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

// noinspection JSUnusedGlobalSymbols
/**
 * The joke command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Joke implements Command
{
    name = 'joke';
    description = 'Tell a joke - what did you think honestly';
    client: Client;
    logger = new Logger(Joke.name);
    category: 'fun' = 'fun';

    /**
     * Creates a new joke command
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
        // Get the joke ID or generate one if omitted
        const joke = i.options.getInteger('joke') || this.client.randomNumber(1, jokes.length + 1);

        // Show an error to the user if the provided joke ID is invalid
        if (joke < 1 || joke > jokes.length) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Invalid joke')
                .addFields([
                    {
                        name: 'You provided an invalid joke ID',
                        value: `Must be between 1 and ${jokes.length}`
                    }
                ])
        ] });

        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('Joke')
                .addFields([
                    {
                        name: `#${joke}`,
                        value: jokes[joke - 1]
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
            .setDescription(this.description)
            .addIntegerOption(option => option.setName('joke')
                .setDescription('Choose a specific joke')) as SlashCommandBuilder;
    }
}
