import { Routes } from 'discord-api-types/v10';
import {
    Client as DiscordClient,
    ClientOptions,
    Collection,
    EmbedBuilder,
    EmbedData,
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    TextChannel,
    User
} from 'discord.js';
import { readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { clearInterval } from 'node:timers';
import { DataSource } from 'typeorm';
import ormconfig from '../../ormconfig';
import ReactionRoleEntity from '../entity/ReactionRole.entity';
import ReminderEntity from '../entity/Reminder.entity';
import { Command } from '../types/Command';
import { event } from '../types/events';
import { CONSTANTS } from './config';
import Logger from './Logger';

/**
 * A custom wrapper of the Discord client, providing more utility methods
 *
 * @author theS1LV3R
 * @since 6.0.0
 * @see {@link DiscordClient}
 */
export default class Client<T extends boolean = boolean> extends DiscordClient<T>
{
    commands: Collection<string, Command> = new Collection();
    db = new DataSource(ormconfig);
    logger = new Logger(Client.name);
    version = process.env.npm_package_version || 'Unknown';
    intervals: NodeJS.Timer[] = [];
    private isReminding = false;

    /**
     * Creates a Client with the provided ClientOptions
     *
     * @param {ClientOptions} options The options for the Client
     *
     * @author theS1LV3R
     * @since 6.0.0
     */
    constructor(options: ClientOptions)
    {
        super(options);

        // Log any errors that might occur
        this.on('error', (e: Error) => this.logger.error(e.message));

        // Connect to the database, load events and commands and set an interval for checking stored reminders
        // This is dumb :)
        this.connectDb().then(() => Promise.all([
            this.loadEvents('../events'),
            this.loadCommands('../commands')
        ])).then(() => this.intervals.push(setInterval(async () =>
        {
            this.isReminding = true;
            const reminders = await this.fetchReminders(true).catch(() =>
            {
                this.logger.error('An error occurred while fetching reminders');
                return [];
            });
            reminders.forEach(r => this.remind(r).catch((e: Error) =>
            {
                // The reminder was probably created in a channel that the bot doesn't have access to
                this.logger.error('An error occurred while trying to process reminders');
                console.error(e);
            }));
            this.isReminding = false;
        }, 1000)));
    }

    /**
     * Logs out, terminates the connection to Discord, and destroys the client.
     *
     * @author Soni
     * @since 6.0.2
     */
    destroy()
    {
        // Clear all registered intervals
        this.intervals.forEach(i => clearInterval(i));

        // Disconnect from the database
        if (this.db.isInitialized) this.db.destroy().catch(e => this.logger.error(`An error occurred while disconnecting from the database: ${e}`));

        super.destroy();
    }

    /**
     * Connects to the database of the Client
     *
     * @returns {Promise<DataSource>} The database of the Client
     *
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link DataSource.initialize}
     */
    async connectDb(): Promise<DataSource>
    {
        this.logger.verbose('Connecting to database');

        // Try to initialize the database connection
        await this.db.initialize().catch((e: Error) =>
        {
            this.logger.error(`Failed to connect to the database: ${e.message}`);
            Promise.reject(e);
        });

        // Run migrations
        this.logger.verbose('Running migrations');
        await this.db.runMigrations().then(() => this.logger.verbose('Ran all migrations successfully'));

        this.logger.info('Connected to the database');
        return this.db;
    }

    /**
     * Loads application events into memory
     *
     * @param {string} dir The directory where the events are located
     * @returns {Promise<number>} The amount of events loaded
     *
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link Client.on}
     */
    async loadEvents(dir: string): Promise<number>
    {
        // Initialise loaded events to 0
        this.logger.verbose(`Loading events from ${dir}...`);
        let successfulLoads = 0;

        // Find event files
        const files = await readdir(resolve(__dirname, dir));
        this.logger.debug(`Found ${files.length} event files`);

        // Load events to memory
        for (const file of files)
        {
            this.logger.debug(`Starting load of ${file}`);

            // Skip files that are not of the correct type
            const filePath = resolve(__dirname, dir, file);
            if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

            // Import the event and define the name
            const event: event<any> = (await import(filePath)).default;
            const eventName = basename(file).split('.')[0];

            // Bind the event to the client
            this.on(eventName as any, event.bind(null, this));

            // Increment successful loads
            successfulLoads++;
            this.logger.debug(`Loaded event ${eventName}`);
        }

        this.logger.info(`Loaded ${successfulLoads} events`);
        return successfulLoads;
    }

    /**
     * Loads slash commands into memory
     *
     * @param {string} dir The directory where the slash commands are located
     * @returns {Promise<Collection<string, Command>>} The Client's loaded slash commands
     *
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link Command}
     */
    async loadCommands(dir: string): Promise<Collection<string, Command>>
    {
        // Find command files
        this.logger.verbose(`Loading slash commands from ${dir}...`);
        const files = await readdir(resolve(__dirname, dir));
        this.logger.debug(`Found ${files.length} files.`);

        // Load commands into memory
        for (const file of files)
        {
            this.logger.debug(`Starting load of ${file}`);
            
            // Skip files that are not of the correct type
            const filePath = resolve(__dirname, dir, file);
            if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

            // Load the command into this.commands
            // noinspection JSPotentiallyInvalidConstructorUsage
            const command: Command = new (await import(filePath)).default(this);
            this.commands.set(command.name, command);
            this.logger.debug(`Loaded slash command ${command.name}`);
        }

        this.logger.info(`Loaded ${this.commands.size} slash commands.`);
        return this.commands;
    }

    /**
     * Deploys the Client's slash commands to the Discord API
     *
     * @returns {Promise<void>} Nothing
     *
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link https://discordjs.guide/creating-your-bot/creating-commands.html#command-deployment-script|DiscordJS command deployment documentation}
     */
    async deployCommands()
    {
        // Create the body of the request
        const body = [];
        for (const command of this.commands) body.push((await command[1].slashCommand()).toJSON());

        // Send the request to the Discord API
        return this.rest.put(Routes.applicationCommands((this as Client<true>).application.id), { body })
            .then(() => this.logger.info('Successfully registered application commands.'))
    }

    /**
     * An embed with the default template applied
     *
     * @param {EmbedData} embed The EmbedData to use for the embed
     * @returns {EmbedBuilder} The default embed with the applied EmbedData
     *
     * @author theS1LV3R
     * @since 6.0.0
     * @see {@link EmbedData}
     */
    defaultEmbed(embed?: EmbedData): EmbedBuilder
    {
        return new EmbedBuilder(embed)
            .setColor(CONSTANTS.COLORS.default)
            .setFooter({
                text: ((this.user?.tag + ' ') ?? '') + `version ${this.version}`,
                iconURL: this.user?.avatarURL({ extension: 'png' }) ?? '',
            });
    }

    /**
     * Get a random number in the provided range
     *
     * @param {number} min The minimum number (included)
     * @param {number} max The maximum number (excluded)
     * @returns {number} The randomly generated number
     *
     * @author Soni
     * @since 6.0.0
     * @see {@link Math.random}
     */
    randomNumber(min: number, max: number)
    {
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * Fetches registered reminders.
     *
     * @param {boolean} due Whether to only include reminders that are due
     * @param {string} user Optional user to filter reminders by
     * @returns {Promise<ReminderEntity[]>} An array of reminders matching the input
     *
     * @author Soni
     * @since 6.0.0
     * @see {@link ReminderEntity}
     */
    async fetchReminders(due: boolean, user?: string): Promise<ReminderEntity[]>
    {
        // Reject the promise if the database is not reachable
        if (!this.db.isInitialized) await Promise.reject();

        // Fetch all active reminders
        let reminders = await ReminderEntity.find({ where: { active: true } });

        // Filter to only include due reminders if desired
        if (due) reminders = reminders.filter(r => r.due.getTime() <= new Date().getTime());

        // Filter to only include reminders for a specific user if desired
        if (user) reminders = reminders.filter(r => r.user === user);

        return reminders;
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
    async remind(reminder: ReminderEntity)
    {
        // Fetch the channel and user from the client cache
        const channel = await this.channels.fetch(reminder.channel);
        const user = await this.users.fetch(reminder.user);

        // Send the reminder
        if (channel instanceof TextChannel) await channel.send({
            content: `> ${user}`,
            embeds: [
                this.defaultEmbed()
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
        this.logger.info(`Reminded ${user.username}#${user.discriminator} of reminder #${reminder.id}`);

        // Mark the reminder as inactive
        reminder.active = false;
        return await reminder.save();
    }

    /**
     * Handles a reaction
     *
     * @param {MessageReaction | PartialMessageReaction} reaction The reaction to handle
     * @param {User | PartialUser} user The user that reacted
     * @param {boolean} reactionExists Whether the reaction was added or removed; `true` = added, `false` = removed
     * @returns {Promise<boolean>} Whether a user's roles were updated
     *
     * @author Soni
     * @since 6.0.0
     */
    async handleReaction(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, reactionExists: boolean)
    {
        // Get all matching reaction roles
        const matchingReactionRoles = await ReactionRoleEntity.find({ where: { message: reaction.message.id, reaction: reaction.emoji.toString() } });

        // Only continue if any reaction roles matches
        if (matchingReactionRoles.length > 0)
        {
            // Get the role ID from the database
            const roleID = matchingReactionRoles[0].role;

            // Make sure nothing is partial
            user = await user.fetch();
            const message = await reaction.message.fetch();

            // Fetch the guild
            const guild = message.guild;
            if (!guild) return;

            // Fetch the GuildMember of the user
            const member = guild.members.cache.get(user.id);
            if (!member) return;

            // Fetch the role
            const role = guild.roles.cache.get(roleID);
            if (!role) return;

            // Set the role
            if (reactionExists) await member.roles.add(role);
            else await member.roles.remove(role);
            this.logger.info(`Set role '${role.name}' to ${reactionExists} on user ${user.tag} in ${guild.name}`);
            return true;
        }

        // No reaction roles matched, return false
        return false;
    }
}
