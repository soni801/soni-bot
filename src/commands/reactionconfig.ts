import {
    ChannelType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    parseEmoji,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import ReactionConfigEntity from '../entity/ReactionConfig.entity';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

// noinspection JSUnusedGlobalSymbols
/**
 * The reaction config command, used to configure community mutes and pins through reactions
 *
 * @author Soni
 * @since 7.6.0
 * @see {@link Command}
 */
export default class ReactionConfig implements Command
{
    name = 'reactionconfig';
    description = 'Configure actions triggered by reactions';
    client: Client;
    logger = new Logger(ReactionConfig.name);
    category: 'moderation' = 'moderation';

    /**
     * Creates a new reaction config command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author Soni
     * @since 7.6.0
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
     * @since 7.6.0
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>): Promise<Message>
    {
        // Only the server owner is allowed to use this command
        if (i.user.id !== i.guild.ownerId) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Insufficient permissions')
                .addFields([
                    {
                        name: 'Only the server owner can use this command',
                        value: 'Reaction actions can only be configured by the owner of this server.'
                    }
                ])
        ] });

        // Fetch the existing config, or create a new one with default values
        const config = await ReactionConfigEntity.findOne({ where: { guild: i.guildId } }) ?? new ReactionConfigEntity({
            guild: i.guildId,
            mute: {
                enabled: false,
                emote: null,
                count: 5,
                minutes: 10,
                notify: true,
                reason: null
            },
            pin: {
                enabled: false,
                emote: null,
                count: 5,
                channel: null
            }
        });

        switch (i.options.getSubcommand())
        {
            case 'mute':
            {
                // Fetch data from command
                const enabled = i.options.getBoolean('enabled', true);
                const emote = i.options.getString('emote');
                const count = i.options.getInteger('count');
                const minutes = i.options.getInteger('minutes');
                const notify = i.options.getBoolean('notify');
                const reason = i.options.getString('reason');

                // Validate and set the emote
                if (emote !== null)
                {
                    const parsedEmote = this._parseEmote(emote);
                    if (!parsedEmote) return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Invalid emote')
                            .addFields([
                                {
                                    name: 'Emote can\'t be used',
                                    value: 'Type a single emote.'
                                }
                            ])
                    ] });

                    // Make sure the emote isn't already used for pins
                    if (parsedEmote === config.pin.emote) return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Emote already in use')
                            .addFields([
                                {
                                    name: 'Emote is used for pins',
                                    value: 'The same emote can\'t be used for both mutes and pins.'
                                }
                            ])
                    ] });

                    config.mute.emote = parsedEmote;
                }

                // Set the rest of the options
                if (count !== null) config.mute.count = count;
                if (minutes !== null) config.mute.minutes = minutes;
                if (notify !== null) config.mute.notify = notify;
                if (reason !== null) config.mute.reason = reason.trim() === '' ? null : reason.trim();

                if (enabled)
                {
                    // An emote is required to enable mutes
                    if (!config.mute.emote) return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Missing emote')
                            .addFields([
                                {
                                    name: 'No emote is set',
                                    value: 'Set an emote with the `emote` option to enable mutes.'
                                }
                            ])
                    ] });

                    // Make sure the bot has mute permissions
                    if (!i.guild.members.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Missing permissions')
                            .addFields([
                                {
                                    name: 'The bot can\'t mute users',
                                    value: 'The bot needs the *Time out members* permission to enable mutes.'
                                }
                            ])
                    ] });
                }
                config.mute.enabled = enabled;

                await config.save();
                this.logger.info(`Updated mute config in ${i.guild.name}`);

                return await i.editReply({ embeds: [
                    this._configEmbed(config)
                        .setColor(CONSTANTS.COLORS.success)
                        .setTitle('Updated reaction mutes')
                ] });
            }
            case 'pin':
            {
                // Fetch data from command
                const enabled = i.options.getBoolean('enabled', true);
                const emote = i.options.getString('emote');
                const count = i.options.getInteger('count');
                const channel = i.options.getChannel('channel');

                // Validate and set the emote
                if (emote !== null)
                {
                    const parsedEmote = this._parseEmote(emote);
                    if (!parsedEmote) return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Invalid emote')
                            .addFields([
                                {
                                    name: 'Emote can\'t be used',
                                    value: 'Type a single emote.'
                                }
                            ])
                    ] });

                    // Make sure the emote isn't already used for mutes
                    if (parsedEmote === config.mute.emote) return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Emote already in use')
                            .addFields([
                                {
                                    name: 'Emote is used for mutes',
                                    value: 'The same emote can\'t be used for both mutes and pins.'
                                }
                            ])
                    ] });

                    config.pin.emote = parsedEmote;
                }

                // Validate and set the channel
                if (channel !== null)
                {
                    const me = i.guild.members.me;
                    if (!me || !channel.permissionsFor(me).has([
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.EmbedLinks
                    ])) return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Missing permissions')
                            .addFields([
                                {
                                    name: 'The bot can\'t post in that channel',
                                    value: `The bot needs the *View channel*, *Send messages* and *Embed links* permissions in ${channel}.`
                                }
                            ])
                    ] });
                    config.pin.channel = channel.id;
                }

                // Set the rest of the options
                if (count !== null) config.pin.count = count;

                // An emote and a channel are required to enable pins
                if (enabled && !config.pin.emote) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('Missing emote')
                        .addFields([
                            {
                                name: 'No emote is set',
                                value: 'Set an emote with the `emote` option to enable pins.'
                            }
                        ])
                ] });
                if (enabled && !config.pin.channel) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('Missing channel')
                        .addFields([
                            {
                                name: 'No channel is set',
                                value: 'Set a channel with the `channel` option to enable pins.'
                            }
                        ])
                ] });
                config.pin.enabled = enabled;

                await config.save();
                this.logger.info(`Updated pin config in ${i.guild.name}`);
                return await i.editReply({ embeds: [
                    this._configEmbed(config)
                        .setColor(CONSTANTS.COLORS.success)
                        .setTitle('Updated reaction pins')
                ] });
            }
            case 'show':
            {
                // Show the current config
                return await i.editReply({ embeds: [
                    this._configEmbed(config)
                        .setTitle('Reaction actions')
                ] });
            }
            default:
                // This should never happen - show an error to the user
                return await i.editReply({ embeds: [
                    this.client.errorEmbed('getSubcommand default branch')
                ] });
        }
    }

    /**
     * Parses an emote typed by the user. Custom emotes are normalized to the format used when reacting,
     * and Unicode emotes are only accepted if the text is exactly one emote.
     *
     * @param {string} text The text to parse
     * @returns {string | null} The emote in the format used when reacting, or `null` if the text isn't an emote
     * @private
     *
     * @author Soni
     * @since 7.6.0
     */
    private _parseEmote(text: string): string | null
    {
        const emote = text.trim();

        // Custom emotes
        const parsed = parseEmoji(emote);
        if (parsed?.id) return `<${parsed.animated ? 'a' : ''}:${parsed.name}:${parsed.id}>`;

        // Unicode emotes. One emote can consist of several characters (skin tones, flags, keycaps), so count graphemes instead
        const graphemes = [ ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(emote) ];
        if (graphemes.length === 1 && /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20E3/u.test(emote)) return emote;

        return null;
    }

    /**
     * Creates an embed showing the reaction action config of a server
     *
     * @param {ReactionConfigEntity} config The config to show
     * @returns {EmbedBuilder} The embed
     * @private
     *
     * @author Soni
     * @since 7.6.0
     */
    private _configEmbed(config: ReactionConfigEntity): EmbedBuilder
    {
        return this.client.defaultEmbed()
            .addFields([
                {
                    name: 'Mute',
                    value: [
                        `**Enabled:** ${config.mute.enabled ? 'Yes' : 'No'}`,
                        `**Emote:** ${config.mute.emote ?? 'Not set'}`,
                        `**Reactions needed:** ${config.mute.count}`,
                        `**Duration:** ${config.mute.minutes} minute(s)`,
                        `**DM muted user:** ${config.mute.notify ? 'Yes' : 'No'}`,
                        `**DM reason:** ${config.mute.reason ?? 'Not set'}`
                    ].join('\n')
                },
                {
                    name: 'Pin',
                    value: [
                        `**Enabled:** ${config.pin.enabled ? 'Yes' : 'No'}`,
                        `**Emote:** ${config.pin.emote ?? 'Not set'}`,
                        `**Reactions needed:** ${config.pin.count}`,
                        `**Channel:** ${config.pin.channel ? `<#${config.pin.channel}>` : 'Not set'}`
                    ].join('\n')
                }
            ]);
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
            .addSubcommand(command => command.setName('mute')
                .setDescription('Mute users whose message gets enough reactions')
                .addBooleanOption(option => option.setName('enabled')
                    .setDescription('Whether reaction mutes are enabled')
                    .setRequired(true))
                .addStringOption(option => option.setName('emote')
                    .setDescription('The emote used to vote for a mute (type one emote)'))
                .addIntegerOption(option => option.setName('count')
                    .setDescription('How many reactions are needed to mute the user')
                    .setMinValue(1)
                    .setMaxValue(100))
                .addIntegerOption(option => option.setName('minutes')
                    .setDescription('How many minutes to mute the user for')
                    .setMinValue(1)
                    .setMaxValue(40320))
                .addBooleanOption(option => option.setName('notify')
                    .setDescription('Whether to send a DM to the muted user'))
                .addStringOption(option => option.setName('reason')
                    .setDescription('Optional reason added to the DM sent to muted users. Enter only whitespace to remove it')
                    .setMaxLength(800)))
            .addSubcommand(command => command.setName('pin')
                .setDescription('Post messages that get enough reactions to a pin channel')
                .addBooleanOption(option => option.setName('enabled')
                    .setDescription('Whether reaction pins are enabled')
                    .setRequired(true))
                .addStringOption(option => option.setName('emote')
                    .setDescription('The emote used to vote for a pin (type one emote)'))
                .addIntegerOption(option => option.setName('count')
                    .setDescription('How many reactions are needed to pin the message')
                    .setMinValue(1)
                    .setMaxValue(100))
                .addChannelOption(option => option.setName('channel')
                    .setDescription('The channel pinned messages are posted in')
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)))
            .addSubcommand(command => command.setName('show')
                .setDescription('Show the reaction action config for this server'));
    }
}
