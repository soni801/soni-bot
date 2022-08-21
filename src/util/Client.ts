import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Client as DiscordClient, ClientOptions, Collection, EmbedBuilder, EmbedData } from 'discord.js';
import { readdir } from 'fs/promises';
import { basename, resolve } from 'node:path';
import { DataSource } from 'typeorm';
import ormconfig from '../../ormconfig';
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
    rest = new REST({ version: '10' });
    version = process.env.npm_package_version || 'Unknown';

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

        // Connect to the database and load events and commands
        this.connectDb().then(() => Promise.all([
            this.loadEvents('../events'),
            this.loadCommands('../commands')
        ]));
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
                text: this.user?.tag ?? '',
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
}
