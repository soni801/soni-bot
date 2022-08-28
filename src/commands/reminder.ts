import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ReminderEntity from '../entity/Reminder.entity';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

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
    async execute(i: ChatInputCommandInteraction<'cached'>)
    {
        // Get the subcommand
        switch (i.options.getSubcommand())
        {
            // Create a new reminder
            case 'create':
                // Fetch data from command
                const content = i.options.getString('reminder', true);
                let time = i.options.getInteger('time', true); // Modifiable to change unit
                const unit = i.options.getString('unit', true);

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
                                value: `You will be reminded <t:${(due.getTime() / 1000).toFixed(0)}:R>`
                            }
                        ])
                ] });
            // List all active reminders
            case 'list':
                // Fetch reminders for the user that called the command
                const reminders = await this.client.fetchReminders(false, i.user.id);

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
     * @returns {Promise<SlashCommandBuilder>} The slash command builder for this command interaction.
     */
    async slashCommand()
    {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(command => command.setName('create')
                .setDescription('Create a reminder')
                .addStringOption(option => option.setName('reminder')
                    .setDescription('What to be reminded of')
                    .setRequired(true))
                .addIntegerOption(option => option.setName('time')
                    .setDescription('The amount of time to wait before sending the reminder')
                    .setRequired(true))
                .addStringOption(option => option.setName('unit')
                    .setDescription('Which time unit to use')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: "days",
                            value: "days"
                        },
                        {
                            name: "hours",
                            value: "hours"
                        },
                        {
                            name: "minutes",
                            value: "minutes"
                        },
                        {
                            name: "seconds",
                            value: "seconds"
                        }
                    )))
            .addSubcommand(command => command.setName('list')
                .setDescription('List all your reminders'));
    }
}
