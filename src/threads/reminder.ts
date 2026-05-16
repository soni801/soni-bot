import ReminderEntity from '../entity/Reminder.entity';
import Thread from '../types/Thread';
import type Client from '../util/Client';
import Logger from '../util/Logger';

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
     */
    async start()
    {
        this._logger.info('Starting reminder thread...');
        this._running = true;

        while (this._running)
        {
            await this._processReminders(); // CATCH?
            await this._sleep(this._sleepAmount);
            this._logger.debug(`Sleeping for ${this._sleepAmount}ms...`);
        }
    }

    /**
     * Stops the reminder thread.
     * The thread will stop after completing the current processing cycle.
     */
    stop()
    {
        this._running = false;
        this._logger.info('Stopped reminder thread');
    }

    /**
     * Fetches and processes all due reminders.
     */
    private async _processReminders()
    {
        // Fetch all due reminders
        const reminders = await this._client.fetchReminders(true).catch((e: Error) =>
        {
            this._logger.error(`An error occurred while fetching reminders: ${e.message}`);
            return [] as ReminderEntity[];
        });

        await Promise.all(reminders.map(reminder => this._client.remind(reminder).catch((e: Error) =>
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
     */
    private async _sleep(ms: number): Promise<void>
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
