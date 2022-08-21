import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { changelog as changelogFile } from '../changelog.json';
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
    private _changelog = changelogFile;

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

        // Show an error if the version is undefined
        if (!version)
        {
            this.logger.error('Version is undefined');
            return await i.editReply({ embeds: [
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
        }

        // Show an error if the provided version does not have a changelist
        if (!this._changelog.find(ver => ver.version === version))
        {
            this.logger.error('The provided version does not have a changelist');
            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle('Invalid version')
                    .addFields([
                        {
                            name: 'The provided version does not have a changelog',
                            value: `Please provide a valid version number.
                            If you did not manually provide a version number, please contact ${this.client.users.cache.get("443058373022318593")}.`
                        }
                    ])
            ] });
        }

        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setTitle('Changelog')
                .addFields(this.changelogMessage(version))
        ] });
    }

    /**
     * Returns a changelog field for the provided version
     *
     * @param {string} version The version to get the changelog from
     * @returns {{name: string, value: string}[]} A embed field containing the changelist
     *
     * @author Soni
     * @since 6.0.0
     */
    changelogMessage(version: string)
    {
        const changes = this._changelog.find(ver => ver.version === version)!.changes;
        let changelist = "";

        changes.forEach(c => changelist += `\u2022 ${c}\n`);

        return [
            {
                name: `Changelog for version ${version}`,
                value: changelist
            }
        ];
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
                .setDescription('The version show the changes for')) as SlashCommandBuilder;
    }
}
