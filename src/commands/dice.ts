import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

/**
 * The dice command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Dice implements Command
{
    name = 'dice';
    description = 'Roll a die';
    client: Client;
    logger = new Logger(Dice.name);
    category: 'useful' = 'useful';

    /**
     * Creates a new dice command
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
        // Define the minimum and maximum values for the output
        // This has to be done like this to only check falsy values other than 0
        const providedMin = i.options.getInteger('min');
        const providedMax = i.options.getInteger('max');
        const min = providedMin !== undefined && providedMin !== null ? providedMin : 1;
        const max = providedMax !== undefined && providedMax !== null ? providedMax : 6;

        // Show an error to the user if the provided range is invalid
        if (min > max) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Failed to roll the die')
                .addFields([
                    {
                        name: 'Invalid range',
                        value: 'The minimum value cannot be larger than the maximum value'
                    }
                ])
        ] });

        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('Rolled a die')
                .addFields([
                    {
                        name: 'Die result',
                        value: this.client.randomNumber(min, max + 1).toString()
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
            .addIntegerOption(option => option.setName('min')
                .setDescription('Custom minimum value'))
            .addIntegerOption(option => option.setName('max')
                .setDescription('Custom maximum value')) as SlashCommandBuilder;
    }
}
