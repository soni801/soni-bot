import {ChatInputCommandInteraction, Message, SlashCommandBuilder} from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import Logger from '../util/Logger';
import UptimeResultEntity from "../entity/UptimeResult.entity";

// noinspection JSUnusedGlobalSymbols
/**
 * The status command
 *
 * @author Soni
 * @since 6.2.7
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
     * @since 6.2.7
     * @see {@link Client}
     */
    constructor(client: Client<true>)
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
     * @since 6.2.7
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>): Promise<Message>
    {
        // Fetch the message and check the latency
        const message = await i.fetchReply();

        // Send reply to user
        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('Soni Bot status')
                .addFields([
                    {
                        name: 'Current uptime',
                        value: this._timeConversion(this.client.uptime)
                    },
                    {
                        name: 'Total latency (RTT)',
                        value: `${message.createdTimestamp - i.createdTimestamp}ms`,
                        inline: true
                    },
                    {
                        name: 'Discord API latency',
                        value: `${Math.round(this.client.ws.ping)}ms`,
                        inline: true
                    },
                    {
                        name: 'Top 5 uptimes (not counting current)',
                        value: await this._topUptimes()
                    }
                ])
        ] });
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
            .setDescription(this.description);
    }

    /**
     * Convert milliseconds to a human-readable format
     *
     * @param {number} duration The amount to convert, in milliseconds
     * @returns {string} The converted amount
     *
     * @author theS1LV3R, Soni
     * @since 6.2.7
     * @see {@link https://stackoverflow.com/a/58826445/9088682|This code on StackOverflow}
     */
    private _timeConversion(duration: number): string
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

    /**
     * Fetch the top 5 uptimes of the bot from the database, and return them in a human-readable format
     *
     * @returns {Promise<string>} A human-readable stringified list of the top uptimes
     *
     * @author Soni
     * @since 6.4.0
     */
    private async _topUptimes(): Promise<string>
    {
        // Show an error if the database is disconnected
        if (!this.client.db.isInitialized) return 'An error occurred while fetching top uptimes';

        // Fetch top 5 uptimes
        let uptimes = await UptimeResultEntity.find({ order: { uptime: 'DESC' }, take: 5 });

        // Stringify the output
        let output = '';
        for (const uptime of uptimes) output += `**${uptimes.indexOf(uptime) + 1}.** _${this._timeConversion(uptime.uptime)}_, achieved <t:${(uptime.achieved.getTime() / 1000).toFixed(0)}:f>\n`;
        if (output === '') output = '_No uptimes on record yet_'; // Tell user if there are no uptimes
        return output;
    }
}
