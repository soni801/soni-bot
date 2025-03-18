import {
    AutocompleteInteraction,
    ChatInputCommandInteraction, Message,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandStringOption, SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import ReminderEntity from '../entity/Reminder.entity';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

// noinspection DuplicatedCode,JSUnusedGlobalSymbols
/**
 * The reminder command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Reminder implements Command
{
    name = 'reminder';
    description = 'Manage reminders';
    client: Client;
    logger = new Logger(Reminder.name);
    category: 'useful' = 'useful';
    private _commandOptions = {
        timeOption: new SlashCommandIntegerOption()
            .setName('time')
            .setDescription('The amount of time to wait before sending the reminder')
            .setRequired(true),
        unitOption: new SlashCommandStringOption()
            .setName('unit')
            .setDescription('Which time unit to use')
            .setRequired(true)
            .addChoices(
                {
                    name: 'days',
                    value: 'days'
                },
                {
                    name: 'hours',
                    value: 'hours'
                },
                {
                    name: 'minutes',
                    value: 'minutes'
                },
                {
                    name: 'seconds',
                    value: 'seconds'
                }
            ),
        reminderOption: new SlashCommandStringOption()
            .setName('reminder')
            .setDescription('The reminder to use')
            .setRequired(true)
            .setAutocomplete(true)
    };

    /**
     * Creates a new reminder command
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
    async execute(i: ChatInputCommandInteraction<'cached'>): Promise<Message>
    {
        // Get the subcommand
        switch (i.options.getSubcommand())
        {
            // Create a new relative reminder
            case 'relative':
            {
                // Fetch data from command
                const content = i.options.getString('reminder', true);
                let time = i.options.getInteger('time', true); // Modifiable to change unit
                const unit = i.options.getString('unit', true);

                // Make sure the reminder is in the future
                if (time < 1) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('An error occurred')
                        .addFields([
                            {
                                name: 'Invalid time',
                                value: 'The provided time must be in the future'
                            }
                        ])
                ] });

                // Calculate time offset in ms
                // noinspection FallThroughInSwitchStatementJS
                switch (unit)
                {
                    case 'days': time *= 24;
                    case 'hours': time *= 60;
                    case 'minutes': time *= 60;
                    case 'seconds': time *= 1000;
                }

                // Store values
                const user = i.user.id;
                const channel = i.channelId;
                const due = new Date(i.createdTimestamp + time);

                // Create and save the reminder
                const reminder = new ReminderEntity({ user, channel, content, due });
                await reminder.save();

                // Calculate what to output as the specified time in the confirmation message
                let outputTime = 'unspecified time';
                switch (unit)
                {
                    case 'days':
                        outputTime = `<t:${(due.getTime() / 1000).toFixed(0)}:D>`;
                        break;
                    case 'hours': case 'minutes':
                        outputTime = `<t:${(due.getTime() / 1000).toFixed(0)}:t>`;
                        break;
                    case 'seconds':
                        outputTime = `<t:${(due.getTime() / 1000).toFixed(0)}:T>`;
                        break;
                }

                // Send a confirmation to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Reminder registered')
                        .addFields([
                            {
                                name: 'Content',
                                value: content
                            },
                            {
                                name: "\u200b",
                                value: `You will be reminded at ${outputTime}`
                            }
                        ])
                ] });
            }
            // Create a new absolute reminder
            case 'absolute':
            {
                // Fetch data from command
                const content = i.options.getString('reminder', true);
                const day = i.options.getInteger('day', true);
                const month = i.options.getInteger('month', true);
                const year = i.options.getInteger('year', true);
                const hour = i.options.getInteger('hour', false);
                const minute = i.options.getInteger('minute', false);
                const second = i.options.getInteger('second', false);

                // Fetch other data
                const user = i.user.id;
                const channel = i.channelId;

                // Declare due time
                const due = new Date();
                due.setDate(day);
                due.setMonth(month);
                due.setFullYear(year);
                if (hour) due.setUTCHours(hour);
                if (minute) due.setMinutes(minute);
                if (second) due.setSeconds(second);

                // Create and save the reminder
                const reminder = new ReminderEntity({ user, channel, content, due });
                await reminder.save();

                // Send a confirmation to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Reminder registered')
                        .addFields([
                            {
                                name: 'Content',
                                value: content
                            },
                            {
                                name: "\u200b",
                                value: `You will be reminded at <t:${(due.getTime() / 1000).toFixed(0)}:f>`
                            }
                        ])
                ] });
            }
            // List all active reminders
            case 'list':
            {
                // Fetch reminders for the user that called the command
                const reminders = (await this.client.fetchReminders(false, i.user.id)).sort((a, b) => a.due.getTime() - b.due.getTime());

                // Determine the output (relevant reminders, stringified)
                let output = '';
                reminders.forEach(r => output += `\u2022 \`${r.content}\`, due <t:${(r.due.getTime() / 1000).toFixed(0)}:R>\n`);
                if (output.length === 0) output = "You have no active reminders.\nCreate one with `/reminder create`.";

                // Send result to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Active reminders')
                        .addFields([
                            {
                                name: 'Your active reminders',
                                value: output
                            }
                        ])
                ] });
            }
            // Edit the due time of a reminder
            case 'time':
            {
                // Fetch data from command
                const reminderId = i.options.getString('reminder', true);
                let time = i.options.getInteger('time', true); // Modifiable to change unit
                const unit = i.options.getString('unit', true);

                // Get the reminder
                const reminder = (await this.client.fetchReminders(false, i.user.id)).find(r => r.id === parseInt(reminderId));

                // Return an error if the reminder doesn't exist
                if (!reminder) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('An error occurred')
                        .addFields([
                            {
                                name: 'Invalid reminder',
                                value: 'The provided reminder does not exist'
                            }
                        ])
                ] });

                // Make sure the reminder is in the future
                if (time < 1) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('An error occurred')
                        .addFields([
                            {
                                name: 'Invalid time',
                                value: 'The provided time must be in the future'
                            }
                        ])
                ] });

                // Calculate time offset in ms
                // noinspection FallThroughInSwitchStatementJS
                switch (unit)
                {
                    case 'days': time *= 24;
                    case 'hours': time *= 60;
                    case 'minutes': time *= 60;
                    case 'seconds': time *= 1000;
                }

                // Edit the reminder
                reminder.due = new Date(i.createdTimestamp + time);
                await reminder.save();
                this.logger.info(`Edited due date of reminder #${reminder.id} on user ${i.user.tag}`);

                // Send result to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Successfully edited reminder')
                        .addFields([
                            {
                                name: 'Reminder',
                                value: reminder.content
                            },
                            {
                                name: 'New due time:',
                                value: `<t:${(reminder.due.getTime() / 1000).toFixed(0)}:R>`
                            }
                        ])
                ] });
            }
            // Edit the content of a reminder
            case 'content':
            {
                // Fetch data from command
                const reminderId = i.options.getString('reminder', true);
                const content = i.options.getString('content', true);

                // Get the reminder
                const reminder = (await this.client.fetchReminders(false, i.user.id)).find(r => r.id === parseInt(reminderId));

                // Return an error if the reminder doesn't exist
                if (!reminder) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('An error occurred')
                        .addFields([
                            {
                                name: 'Invalid reminder',
                                value: 'The provided reminder does not exist'
                            }
                        ])
                ] });

                // Edit the reminder
                reminder.content = content;
                await reminder.save();
                this.logger.info(`Edited content of reminder #${reminder.id} on user ${i.user.tag}`);

                // Send result to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Successfully edited reminder')
                        .addFields([
                            {
                                name: 'New content:',
                                value: reminder.content
                            }
                        ])
                ] });
            }
            // Delete a reminder
            case 'delete':
            {
                // Fetch the reminder from the command
                const reminderId = i.options.getString('reminder', true);
                const reminder = (await this.client.fetchReminders(false, i.user.id)).find(r => r.id === parseInt(reminderId));

                // Return an error if the reminder doesn't exist
                if (!reminder) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('An error occurred')
                        .addFields([
                            {
                                name: 'Invalid reminder',
                                value: 'The provided reminder does not exist'
                            }
                        ])
                ] });

                // Delete the reminder
                reminder.active = false;
                await reminder.save();
                this.logger.info(`Deleted reminder #${reminder.id} on user ${i.user.tag}`);

                // Send result to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Deleted reminder')
                        .addFields([
                            {
                                name: 'Successfully deleted the reminder',
                                value: reminder.content
                            }
                        ])
                ] });
            }
            // Clear all your reminders
            case 'clear':
            {
                // Fetch all reminders from the user that called the command
                const userReminders = await this.client.fetchReminders(false, i.user.id);

                // Set all reminders as inactive
                for (const reminder of userReminders)
                {
                    reminder.active = false;
                    await reminder.save();
                    this.logger.info(`Deleted reminder #${reminder.id} on user ${i.user.tag}`);
                }

                // Send result to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Deleted reminder')
                        .addFields([
                            {
                                name: 'Successfully cleared reminders',
                                value: `Deleted ${userReminders.length} reminder(s).`
                            }
                        ])
                ] });
            }
            default:
                // This should never happen - show an error to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('An error occurred')
                        .addFields([
                            {
                                name: 'An internal error prevented the command from being executed',
                                value: `This should never happen, please contact ${this.client.users.cache.get("443058373022318593")}.`
                            }
                        ])
                ] });
        }
    }

    /**
     * The slash command builder for this command interaction.
     *
     * @returns {Promise<SlashCommandSubcommandsOnlyBuilder>} The slash command builder for this command interaction.
     */
    async slashCommand(): Promise<SlashCommandSubcommandsOnlyBuilder>
    {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommandGroup(group => group.setName('create')
                .setDescription('Create a reminder')
                .addSubcommand(command => command.setName('relative')
                    .setDescription('Create a reminder relative to the current time')
                    .addStringOption(option => option.setName('reminder')
                        .setDescription('What to be reminded of')
                        .setRequired(true))
                    .addIntegerOption(this._commandOptions.timeOption)
                    .addStringOption(this._commandOptions.unitOption))
                .addSubcommand(command => command.setName('absolute')
                    .setDescription('Create a reminder at a specific time')
                    .addStringOption(option => option.setName('reminder')
                        .setDescription('What to be reminded of')
                        .setRequired(true))
                    .addIntegerOption(option => option.setName('day')
                        .setDescription('The date of the month to be reminded')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(31))
                    .addIntegerOption(option => option.setName('month')
                        .setDescription('The month to be reminded')
                        .setRequired(true)
                        .addChoices(
                            { name: 'January', value: 0 },
                            { name: 'February', value: 1 },
                            { name: 'March', value: 2 },
                            { name: 'April', value: 3 },
                            { name: 'May', value: 4 },
                            { name: 'June', value: 5 },
                            { name: 'July', value: 6 },
                            { name: 'August', value: 7 },
                            { name: 'September', value: 8 },
                            { name: 'October', value: 9 },
                            { name: 'November', value: 10 },
                            { name: 'December', value: 11 }
                        ))
                    .addIntegerOption(option => option.setName('year')
                        .setDescription('The year to be reminded')
                        .setRequired(true)
                        .setMinValue(2000))
                    .addIntegerOption(option => option.setName('hour')
                        .setDescription('The hour to be reminded (UTC timezone)')
                        .setMinValue(0)
                        .setMaxValue(23))
                    .addIntegerOption(option => option.setName('minute')
                        .setDescription('The minute to be reminded')
                        .setMinValue(0)
                        .setMaxValue(59))
                    .addIntegerOption(option => option.setName('second')
                        .setDescription('The second to be reminded')
                        .setMinValue(0)
                        .setMaxValue(59))))
            .addSubcommand(command => command.setName('list')
                .setDescription('List all your reminders'))
            .addSubcommandGroup(group => group.setName('edit')
                .setDescription('Edit a reminder')
                .addSubcommand(command => command.setName('time')
                    .setDescription('Edit the due time of a reminder')
                    .addStringOption(this._commandOptions.reminderOption)
                    .addIntegerOption(this._commandOptions.timeOption)
                    .addStringOption(this._commandOptions.unitOption))
                .addSubcommand(command => command.setName('content')
                    .setDescription('Edit the content of a reminder')
                    .addStringOption(this._commandOptions.reminderOption)
                    .addStringOption(option => option.setName('content')
                        .setDescription('What to be reminded of')
                        .setRequired(true))))
            .addSubcommand(command => command.setName('delete')
                .setDescription('Delete a reminder')
                .addStringOption(this._commandOptions.reminderOption))
            .addSubcommand(command => command.setName('clear')
                .setDescription('Delete all your reminders'));
    }

    /**
     * Handles autocomplete for this command interaction.
     *
     * @param {AutocompleteInteraction<"cached">} i The interaction object
     * @returns {Promise<void>} Nothing
     *
     * @author Soni
     * @since 6.2.0
     */
    async handleAutocomplete(i: AutocompleteInteraction<'cached'>): Promise<void>
    {
        // Get the focused value
        const focusedValue = i.options.getFocused();

        // Get all user reminders
        const reminders = await this.client.fetchReminders(false, i.user.id);

        // Filter user's reminders by entries matching the focused value
        const search = (s: string) => s.toLowerCase().replace(/['.!,?]/gi, '').includes(focusedValue);
        const filteredReminders: any[] = reminders.filter(r => search(r.content)).filter((_r, i) => i < 25);

        // Format changelog to comply with autocomplete syntax
        filteredReminders.map(reminder =>
        {
            reminder.name = reminder.content;
            reminder.value = reminder.id.toString();
        });

        // Return the filtered response list
        await i.respond(filteredReminders);
    }
}
