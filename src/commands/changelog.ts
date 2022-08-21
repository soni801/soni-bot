import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    MessageActionRowComponentBuilder,
    SelectMenuBuilder,
    SlashCommandBuilder,
    WebhookEditMessageOptions
} from 'discord.js';
import { changelog as changelogFile } from '../changelog.json';
import { Changelist } from '../types';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

/**
 * The changelog command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Changelog implements Command
{
    name = 'changelog';
    description = 'Display changes made in a specific version';
    client: Client;
    logger = new Logger(Changelog.name);
    private _changelog = changelogFile as Changelist[];

    /**
     * Creates a new changelog command
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

        // Format changelog to comply with select menu syntax
        this._changelog.forEach(version => version.name = `v${version.version}`);
        this._changelog.forEach(version => version.label = `v${version.version}`);
        this._changelog.forEach(version => version.value = version.version);
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
        // Get the current version
        const version = i.options.getString('version') || process.env.npm_package_version;
        let error = false;

        // Log an error if the version is undefined
        if (!version)
        {
            this.logger.error('Version is undefined');
            error = true;
        }

        // Log an error if the provided version does not have a changelist
        if (!this._changelog.find(ver => ver.version === version))
        {
            this.logger.error('The provided version does not have a changelist');
            error = true;
        }

        // Show an error to the user if any problems occurred
        if (error) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('An error occurred')
                .addFields([
                    {
                        name: 'An internal error prevents sending the changelog',
                        value: `Please contact ${this.client.users.cache.get("443058373022318593")} if this keeps happening.`
                    }
                ])
        ] });

        return await i.editReply(this.changelistMessage(version!));
    }

    /**
     * Returns a changelist message for the provided version
     *
     * @param {string} version The version to get the changelist from
     * @returns {WebhookEditMessageOptions} A message containing the changelist
     *
     * @author Soni
     * @since 6.0.0
     */
    changelistMessage(version: string): WebhookEditMessageOptions
    {
        // Get the changes for the provided version
        const changes = this._changelog.find(ver => ver.version === version)!.changes;
        let changelist = "";

        // Format the changes and store them in changelist
        changes.forEach(c => changelist += `\u2022 ${c}\n`);

        return {
            embeds: [
                this.client.defaultEmbed()
                    .setTitle('Changelog')
                    .addFields([
                        {
                            name: `Changelog for version ${version}`,
                            value: changelist
                        }
                    ])
            ],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('changelog')
                            .setPlaceholder('Select a version')
                            .addOptions(...this._changelog)
                    )
            ]
        };
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
            .addStringOption(option => option.setName('version')
                .setDescription('The version show the changes for')
                .setChoices(...this._changelog)) as SlashCommandBuilder;
    }
}
