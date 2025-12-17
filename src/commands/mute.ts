import {Command} from "../types/Command";
import Client from "../util/Client";
import Logger from "../util/Logger";
import {
    ChatInputCommandInteraction,
    Message,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder
} from "discord.js";
import {CONSTANTS} from "../util/config";

/**
 * The mute command
 *
 * @author Soni
 * @since 7.3.0
 * @see {@link Command}
 */
export default class Mute implements Command
{
    name = 'mute';
    description = 'Mute a user';
    client: Client;
    logger = new Logger(Mute.name);
    category: 'moderation' = 'moderation';

    /**
     * Creates a new mute command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author Soni
     * @since 7.3.0
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
     * @since 7.3.0
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>): Promise<Message>
    {
        // Make sure the user has permission to use the command
        if (!i.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Insufficient permissions')
                .addFields([
                    {
                        name: 'You do not have the necessary permissions',
                        value: 'You need the *Time out members* permission to be able to use this command.'
                    }
                ])
        ] });

        // Get mute duration
        const duration = i.options.getInteger('minutes', true);

        if (duration < 1)
        {
            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't mute user")
                    .addFields([
                        {
                            name: 'Invalid duration',
                            value: 'Duration cannot be less than 1 minute'
                        }
                    ])
            ] });
        }

        if (duration > 40320)
        {
            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't mute user")
                    .addFields([
                        {
                            name: 'Invalid duration',
                            value: 'Duration cannot be more than 28 days (40320 minutes)'
                        }
                    ])
            ] });
        }

        // Get mute reason
        let reason = i.options.getString('reason');
        if (!reason) reason = `Requested by ${i.user.tag}`;

        // Get the member
        const user = i.options.getUser('user', true);
        const member = await i.guild.members.fetch(user);

        // Don't let users mute themselves
        if (user.id === i.user.id) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Invalid user')
                .addFields([
                    {
                        name: 'You cannot mute yourself',
                        value: 'silly goofy'
                    }
                ])
        ] });

        // Don't allow muting users that are already muted
        if (member.isCommunicationDisabled())
        {
            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't mute user")
                    .addFields([
                        {
                            name: `${user.tag} is already muted`,
                            value: `Mute expires <t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}:R>. Use \`/unmute\` to remove the mute now`
                        }
                    ])
            ] });
        }

        // Make sure the bot has mute permissions
        if (!i.guild.members.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't mute user")
                    .addFields([
                        {
                            name: `Failed to mute ${user.tag}`,
                            value: 'The bot needs the *Time out members* permission to use this command'
                        }
                    ])
            ]
        });

        // Make sure the user to mute doesn't have administrative privileges
        // I think this fixes https://github.com/soni801/soni-bot/issues/13
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle(`Couldn't mute user`)
                .addFields([
                    {
                        name: 'The specified user has administrative permissions',
                        value: 'Why would you mute an admin anyway?'
                    }
                ])
        ] });

        // Error if the bot's role is lower than the member's highest role (this would probably be blocked on discord's end)
        if (i.guild.members.me.roles.highest.position <= member.roles.highest.position) return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle(`Couldn't mute user`)
                    .addFields([
                        {
                            name: `Bot's role is too low`,
                            value: `The bot's highest role must be above the target user's highest role to perform this action.`
                        }
                    ])
            ]
        });

        // Mute the member
        try
        {
            await member.timeout(duration * 60 * 1000, reason);

            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.success)
                    .setTitle('Muted user')
                    .addFields([
                        {
                            name: 'Successfully muted user',
                            value: `Muted ${user} for ${duration} minute(s).`
                        },
                        {
                            name: 'Reason',
                            value: reason
                        }
                    ])
            ] });
        }
        catch (error)
        {
            // This should never happen - show an error to the user
            return await i.editReply({ embeds: [
                this.client.errorEmbed(error)
            ] });
        }
    }

    /**
     * The slash command builder for this command interaction
     *
     * @returns {Promise<SlashCommandOptionsOnlyBuilder>} The slash command builder for this command interaction
     */
    async slashCommand(): Promise<SlashCommandOptionsOnlyBuilder>
    {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
            .addIntegerOption(option => option.setName('minutes')
                .setDescription('How many minutes to mute the user for')
                .setRequired(true))
            .addStringOption(option => option.setName('reason')
                .setDescription('The reason for the mute'));
    }
}
