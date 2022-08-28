import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder, TextChannel } from 'discord.js';
import ReactionRoleEntity from '../entity/ReactionRole.entity';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

/**
 * The reaction role command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class ReactionRole implements Command
{
    name = 'reactionrole';
    description = 'Manage reaction roles in a server';
    client: Client;
    logger = new Logger(ReactionRole.name);
    category: 'moderation' = 'moderation';

    /**
     * Creates a new reaction role command
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
        // Make sure the user has permission to use the command
        if (!i.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.warning)
                .setTitle('Insufficient permissions')
                .addFields([
                    {
                        name: 'You do not have the necessary permissions',
                        value: 'You need the *Manage Roles* permission to be able to use this command.'
                    }
                ])
        ] });

        switch (i.options.getSubcommand())
        {
            case 'create':
                // Fetch data from command
                const message = i.options.getString('message', true);
                const emote = i.options.getString('emote', true);
                const role = i.options.getRole('role', true);

                // Fetch the bot user
                const me = i.guild.members.me;
                if (!me) return;

                // Make sure the role is available to assign
                if (role.comparePositionTo(me.roles.highest) > 0) return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('Can\'t use role')
                        .addFields([
                            {
                                name: 'Role has too high permissions',
                                value: 'You can only assign roles that are lower in the hierarchy than the role(s) for this bot.'
                            }
                        ])
                ] });

                // Fetch the channel and message object
                let channel, messageObject;
                try
                {
                    channel = this.client.channels.cache.get(i.channelId) as TextChannel;
                    messageObject = await channel.messages.fetch(message);
                }
                catch
                {
                    // Show an error to the user
                    return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Incorrect channel')
                            .addFields([
                                {
                                    name: 'The channel in invalid',
                                    value: 'The reaction message must be in the same channel as this command interaction.'
                                }
                            ])
                    ] });
                }

                // Define the reaction and react using it
                let reaction;
                try
                {
                    reaction = emote.trim();
                    await messageObject.react(reaction);
                }
                catch
                {
                    // Show an error to the user
                    return await i.editReply({ embeds: [
                        this.client.defaultEmbed()
                            .setColor(CONSTANTS.COLORS.warning)
                            .setTitle('Invalid emote')
                            .addFields([
                                {
                                    name: 'Emote can\'t be used',
                                    value: 'The reaction emote has to either be from this server or be a global emoji.'
                                }
                            ])
                    ] });
                }

                // Create and save the reaction role
                const reactionRole = new ReactionRoleEntity({ message, reaction: reaction, role: role.id });
                await reactionRole.save();

                // Send a confirmation to the user
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setTitle('Successfully created reaction role')
                        .addFields([
                            {
                                name: 'Reaction role registered',
                                value: 'This reaction role is now active.'
                            }
                        ])
                ] });
            case "remove":
                return await i.editReply({ embeds: [
                    this.client.defaultEmbed()
                        .setColor(CONSTANTS.COLORS.warning)
                        .setTitle('Not implemented')
                        .addFields([
                            {
                                name: 'Can\'t remove reaction role',
                                value: `Removing reaction roles has not yet been implemented. Contact ${this.client.users.cache.get("443058373022318593")} if you want a reaction role to be removed.`
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
                .setDescription('Create a reaction role')
                .addStringOption(option => option.setName('message')
                    .setDescription('The message to register the reaction role for (right click, copy ID)')
                    .setRequired(true))
                .addStringOption(option => option.setName('emote')
                    .setDescription('The emote used for the reaction role (type one emote)')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role')
                    .setDescription('The role to assign')
                    .setRequired(true)))
            .addSubcommand(command => command.setName('remove')
                .setDescription('Remove a reaction role tied to a message')
                .addStringOption(option => option.setName('message')
                    .setDescription('The message to remove the reaction role from (right click, copy ID)')
                    .setRequired(true)));
    }
}
