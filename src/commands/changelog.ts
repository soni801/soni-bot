import { ButtonStyle } from 'discord-api-types/v10';
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
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
    category: 'bot' = 'bot';
    private _changelog = changelogFile as Changelist[];
    private _selectMenuArrays: Changelist[][] = [];

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

        // Format changelog to comply with command choice and select menu syntax
        this._changelog.map(version =>
        {
            version.name = version.version;
            version.label = version.version;
            version.value = version.version;
        });

        // Split the changelog into select menu arrays (max. size 25)
        for (let i = 0; i < this._changelog.length; i += 25)
        {
            this._selectMenuArrays.push(this._changelog.slice(i, i + 25));
        }
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
        const version = i.options.getString('version') || this.client.version;

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
                            name: 'The provided version does not have a changelist',
                            value: 'Please provide a valid version'
                        }
                    ])
            ] });
        }

        return await i.editReply(this.changelistMessage(version));
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
            components: this.versionSelectComponents(0)
        };
    }

    /**
     * Gets the select menu and buttons for a specified changelog page.
     *
     * @param {number} changelogPage The changelog page to use for the select menu
     * @returns {ActionRowBuilder<MessageActionRowComponentBuilder>[]} The message components for the specified changelog page
     *
     * @author Soni
     * @since 6.1.0
     */
    versionSelectComponents(changelogPage: number): ActionRowBuilder<MessageActionRowComponentBuilder>[]
    {
        // Store the selected page
        const selectMenuArray = this._selectMenuArrays[changelogPage];

        return [
            new ActionRowBuilder<SelectMenuBuilder>()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('changelog')
                        .setPlaceholder(`Select a version (${selectMenuArray[selectMenuArray.length - 1].version} - ${selectMenuArray[0].version})`)
                        .addOptions(...selectMenuArray)
                ),
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${changelogPage}-changelog-older`)
                        .setLabel('\u2b05 Older')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(changelogPage === this._selectMenuArrays.length - 1),
                    new ButtonBuilder()
                        .setCustomId(`${changelogPage}-changelog-newer`)
                        .setLabel('Newer \u27a1')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(changelogPage === 0)
                )
        ]
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
                .setAutocomplete(true)) as SlashCommandBuilder;
    }

    /**
     * Handles autocomplete for this command interaction.
     *
     * @param {AutocompleteInteraction<"cached">} i The interaction object
     * @returns {Promise<void>} Nothing
     *
     * @author Soni
     * @since 6.1.0
     */
    async handleAutocomplete(i: AutocompleteInteraction<'cached'>)
    {
        // Get the focused value
        const focusedValue = i.options.getFocused().toLowerCase();

        // Filter the changelog list by entries matching the focused value
        const filteredChangelogList = this._changelog.filter(version => version.version.toLowerCase().includes(focusedValue)).filter((r, i) => i < 25);

        // Return the filtered response list
        await i.respond(filteredChangelogList);
    }
}
