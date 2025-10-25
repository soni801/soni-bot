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
 * The ban command
 *
 * @author Soni
 * @since 7.3.0
 * @see {@link Command}
 */
export default class Ban implements Command
{
    name = 'ban';
    description = 'Ban a user';
    client: Client;
    logger = new Logger(Ban.name);
    category: 'moderation' = 'moderation';

    /**
     * Creates a new ban command
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
        if (!i.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Insufficient permissions')
                .addFields([
                    {
                        name: 'You do not have the necessary permissions',
                        value: 'You need the *Ban Members* permission to be able to use this command.'
                    }
                ])
        ] });

        // Get user to ban
        const user = i.options.getUser('user', true);
        const member = await i.guild.members.fetch(user);

        // Don't let users ban themselves
        if (user.id === i.user.id) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Invalid user')
                .addFields([
                    {
                        name: 'You cannot ban yourself',
                        value: 'silly goofy'
                    }
                ])
        ] });


        // Make sure the bot has ban permissions
        if (!i.guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't ban user")
                    .addFields([
                        {
                            name: `Failed to ban ${user.tag}`,
                            value: 'The bot needs the *Ban Members* permission to use this command.'
                        }
                    ])
            ]
        });

        // Check if the ban was forced
        const force = i.options.getBoolean('force');

        // Make sure the user to ban doesn't have administrative privileges
        if (!force &&
            (member.permissions.has(PermissionsBitField.Flags.ManageGuild)
            || member.permissions.has(PermissionsBitField.Flags.BanMembers)
            || member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
            || member.permissions.has(PermissionsBitField.Flags.ManageMessages)
            || member.permissions.has(PermissionsBitField.Flags.ManageThreads)
            || member.permissions.has(PermissionsBitField.Flags.Administrator))
        ) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle(`Couldn't ban user`)
                .addFields([
                    {
                        name: `The specified user has administrative permissions`,
                        value: `To avoid accidental bans, requests targeting members with any administrative permissions are prevented by default.
                        
                        This includes the following permissions:
                        \`Manage Server\`, \`Ban Members\`, \`Time out members\`, \`Manage Messages\`, \`Manage Threads and Posts\`, \`Administrator\`
                        
                        To bypass this restriction, use the \`force\` flag.`
                    }
                ])
        ] });

        // Error if the bot's role is lower than the member's highest role (this would probably be blocked on discord's end)
        if (i.guild.members.me.roles.highest.position <= member.roles.highest.position) return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle(`Couldn't ban user`)
                    .addFields([
                        {
                            name: `Bot's role is too low`,
                            value: `The bot's highest role must be above the target user's highest role to perform this action.`
                        }
                    ])
            ]
        });


        // Get ban reason
        let reason = i.options.getString('reason');
        if (!reason) reason = `Requested by ${i.user.tag}`;

        // Make sure ban reason is within a reasonable length limit
                if (reason.length > 1000) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('An error occurred')
                        .addFields([
                            {
                                name: 'Invalid Reason',
                                value: 'The unban reason cannot exceed 1000 characters'
                            }
                        ])
                    ] });
        
        // Get message delete seconds
        let deleteMessageSeconds = i.options.getInteger('delete');
        if (deleteMessageSeconds) deleteMessageSeconds *= (60 * 60);

        // Ban the specified user
        try
        {
            // First, notify the user
            await user.send({ embeds: [
                this.client.defaultEmbed()
                    .setTitle('You have been banned')
                    .addFields([
                        {
                            name: `You were banned from ${i.guild.name}`,
                            value: `Reason: ${reason}`
                        }
                    ])
            ] }).catch(e => this.logger.warn(`Failed to notify ${user.tag} of ban: ${e}`));

            // After that's done, remove them from the server
            if (deleteMessageSeconds) await i.guild.members.ban(user, { reason, deleteMessageSeconds });
            else await i.guild.members.ban(user, { reason });

            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.success)
                    .setTitle('Banned user')
                    .addFields([
                        {
                            name: `Successfully banned ${user.tag}`,
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
                .setDescription('The user to ban')
                .setRequired(true))
            .addStringOption(option => option.setName('reason')
                .setDescription('The reason for the ban'))
            .addIntegerOption(option => option.setName('delete')
                .setDescription('Optionally delete the users messages sent the last X hours')
                .setMinValue(1)
                .setMaxValue(168))
            .addBooleanOption(option => option.setName('force')
                .setDescription('Attempt the ban regardless of target user permissions'));
    }
}
