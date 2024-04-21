import {
    ActionRowBuilder,
    ChatInputCommandInteraction, Message,
    MessageActionRowComponentBuilder,
    SelectMenuBuilder,
    SlashCommandBuilder
} from 'discord.js';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import Logger from '../util/Logger';

/**
 * The help command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Help implements Command
{
    name = 'help';
    description = 'Display help message';
    client: Client;
    logger = new Logger(Help.name);
    category: 'bot' = 'bot';
    private _CATEGORIES = [
        {
            label: "Soni Bot",
            name: "Soni Bot",
            description: "Commands for information about the bot",
            value: "bot"
        },
        {
            label: "Useful",
            name: "Useful",
            description: "Useful commands",
            value: "useful"
        },
        {
            label: "Moderation",
            name: "Moderation",
            description: "Commands for server moderation",
            value: "moderation"
        },
        {
            label: "Fun",
            name: "Fun",
            description: "Fun, not so useful commands",
            value: "fun"
        }
    ];

    /**
     * Creates a new help command
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
        return await i.editReply(this.helpMessage(i.options.getString('category') || undefined));
    }

    helpMessage(category?: string)
    {
        // Declare the help message header that is always shown
        const header = [
            {
                name: "Version",
                value: this.client.version,
                inline: true
            },
            {
                name: "Changelog",
                value: "See `/changelog`",
                inline: true
            },
            {
                name: "\u200b",
                value: "\u200b"
            }
        ];

        // Declare an empty variable to store the full field list
        let fields = [];

        // Show a category if supplied
        if (category)
        {
            // Declare category header
            fields = header.concat([
                {
                    name: `${this._capitalizeFirstLetter(category)} commands`,
                    value: "\u200b"
                }
            ]);

            // Fetch the relevant commands
            const commandFields = this.client.commands.filter(command => command.category === category);

            // Add commands if any, otherwise add message stating no commands
            if (commandFields.size > 0) commandFields.forEach(command =>
            {
                fields.push({
                    name: `\`/${command.name}\``,
                    value: command.description
                })
            });
            else fields = fields.concat([
                {
                    name: "No commands",
                    value: "There are no commands available in this category."
                },
                {
                    name: "\u200b",
                    value: "\u200b"
                }
            ]);
        }
        // If no category is supplied, return the default content
        else fields = header.concat([
            {
                name: "Welcome to Soni Bot!",
                value: "Please select a help category."
            },
            {
                name: "\u200b",
                value: "\u200b"
            }
        ]);

        return {
            embeds: [
                this.client.defaultEmbed()
                    .setTitle('Soni Bot Help')
                    .addFields(fields)
            ],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('help')
                            .setPlaceholder('Select a category')
                            .addOptions(...this._CATEGORIES)
                    )
            ]
        };
    }

    private _capitalizeFirstLetter(string: string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
            .setDescription(this.description)
            .addStringOption(option => option.setName('category')
                .setDescription('The help category to show')
                .addChoices(...this._CATEGORIES)) as SlashCommandBuilder;
    }
}
