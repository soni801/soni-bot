import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import Logger from '../util/Logger';

// noinspection JSUnusedGlobalSymbols
/**
 * The status command
 *
 * @author Soni
 * @since 6.0.0 // FIXME
 * @see {@link Command}
 */
export default class Status implements Command
{
    name = 'status';
    description = 'Display bot status and runtime information';
    client: Client<true>;
    logger = new Logger(Status.name);
    category: 'bot' = 'bot';

    /**
     * Creates a new status command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author Soni
     * @since 6.0.0 // FIXME
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
     * @since 6.0.0 // FIXME
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>)
    {
        // Fetch the message and check the latency
        const message = await i.fetchReply();

        // Send reply to user
        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('Soni Bot status')
                .addFields([
                    {
                        name: "Uptime",
                        value: this._timeConversion(this.client.uptime)
                    },
                    {
                        name: 'Soni Bot latency (RTT)',
                        value: `${message.createdTimestamp - i.createdTimestamp}ms`
                    },
                    {
                        name: 'Discord API latency',
                        value: `${Math.round(this.client.ws.ping)}ms`
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

    /**
     * Convert milliseconds to a human-readable format
     *
     * @param {number} duration The amount to convert, in milliseconds
     * @returns {string} The converted amount
     *
     * @author theS1LV3R, Soni
     * @since 6.0.0 // FIXME
     * @see {@link https://stackoverflow.com/a/58826445/9088682|This code on StackOverflow}
     */
    private _timeConversion(duration: number)
    {
        const portions: string[] = [];

        // This will fail at the time of DST, but that is rare enough for us to ignore it :)
        const msInDay = 1000 * 60 * 60 * 24;
        const days = Math.trunc(duration / msInDay);
        if (days > 0)
        {
            portions.push(days + 'd');
            duration = duration - days * msInDay;
        }

        const msInHour = 1000 * 60 * 60;
        const hours = Math.trunc(duration / msInHour);
        if (hours > 0)
        {
            portions.push(hours + 'h');
            duration = duration - hours * msInHour;
        }

        const msInMinute = 1000 * 60;
        const minutes = Math.trunc(duration / msInMinute);
        if (minutes > 0)
        {
            portions.push(minutes + 'm');
            duration = duration - minutes * msInMinute;
        }

        const msInSecond = 1000;
        const seconds = Math.trunc(duration / msInSecond);
        if (seconds > 0)
        {
            portions.push(seconds + 's');
            duration = duration - seconds * msInSecond;
        }

        portions.push(duration + 'ms');
        return portions.join(" ");
    }
}
