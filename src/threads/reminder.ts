import ReminderEntity from '../entity/Reminder.entity';
import Thread from '../types/Thread';
import type Client from '../util/Client';
import Logger from '../util/Logger';
import {TextChannel} from "discord.js";

/**
 * The `reminder` thread handles fetching reminders and sending notifications for ones that are due.
 *
 * @author Soni
 * @since 7.5.3
 * @see {@link Thread}
 */
export default class Reminder implements Thread
{
    private readonly _client: Client;
    private readonly _logger = new Logger(Reminder.name);

    /**
     * Indicates whether the reminder thread is currently running.
     */
    private _running = false;

    /**
     * The amount of time to sleep between processing cycles.
     */
    private _sleepAmount = 1000;

    /**
     * Creates a new Reminder thread instance.
     *
     * @param client - The Discord client instance used to interact with the bot.
     */
    constructor(client: Client)
    {
        this._client = client;
    }

    /**
     * Starts the reminder thread.
     * Continuously processes reminders every second until the thread is stopped.
     *
     * @author Soni
     * @since 7.5.3
     */
    async start()
    {
        this._logger.info('Starting reminder thread...');
        this._running = true;

        while (this._running)
        {
            await this._processReminders();
            await this._sleep(this._sleepAmount);
            this._logger.debug(`Sleeping for ${this._sleepAmount}ms...`);
        }
    }

    /**
     * Stops the reminder thread.
     * The thread will stop after completing the current processing cycle.
     *
     * @author Soni
     * @since 7.5.3
     */
    stop()
    {
        this._running = false;
        this._logger.info('Stopped reminder thread');
    }

    /**
     * Fetches and processes all due reminders.
     *
     * @author Soni
     * @since 7.5.3
     */
    private async _processReminders()
    {
        // Fetch all due reminders
        const reminders = await this._client.fetchReminders(true).catch((e: Error) =>
        {
            this._logger.error(`An error occurred while fetching reminders: ${e.message}`);
            return [] as ReminderEntity[];
        });

        await Promise.all(reminders.map(reminder => this._remind(reminder).catch((e: Error) =>
        {
            // The reminder was probably created in a channel that the bot doesn't have access to.
            this._logger.error(`An error occurred while trying to process reminder #${reminder.id}: ${e.message}`);
            console.error(e);
        })));
    }

    /**
     * Pauses execution for a specified duration.
     *
     * @param ms - The number of milliseconds to sleep.
     * @returns A promise that resolves after the specified duration.
     *
     * @author Soni
     * @since 7.5.3
     */
    private async _sleep(ms: number): Promise<void>
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Reminds a user of a given reminder
     *
     * @param {ReminderEntity} reminder The reminder to remind the user of
     * @returns {Promise<ReminderEntity>} The reminder
     *
     * @author Soni
     * @since 6.0.0
     * @see {@link ReminderEntity}
     */
    private async _remind(reminder: ReminderEntity): Promise<ReminderEntity>
    {
        // Fetch the channel and user from the client cache
        const channel = await this._client.channels.fetch(reminder.channel);
        const user = await this._client.users.fetch(reminder.user);

        // Send the reminder
        if (channel instanceof TextChannel) await channel.send({
            content: `> ${user}`,
            embeds: [
                this._client.defaultEmbed()
                    .setTitle('Reminder')
                    .addFields([
                        {
                            name: 'Here is your reminder',
                            value: reminder.content
                        }
                    ])
            ]
        });

        // Log the reminder
        this._logger.info(`Reminded ${user.username} of reminder #${reminder.id}`);

        // Mark the reminder as inactive
        reminder.active = false;
        return await reminder.save();
    }
}
