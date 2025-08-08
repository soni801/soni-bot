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
 * The unmute command
 *
 * @author Soni
 * @since 7.3.0
 * @see {@link Command}
 */
export default class Unmute implements Command
{
    name = 'unmute';
    description = 'Remove the mute from a user';
    client: Client;
    logger = new Logger(Unmute.name);
    category: 'moderation' = 'moderation';

    /**
     * Creates a new unmute command
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

        // Get the member
        const user = i.options.getUser('user', true);
        const member = await i.guild.members.fetch(user);

        if (!member.isCommunicationDisabled())
        {
            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't unmute user")
                    .addFields([
                        {
                            name: `${user.tag} is not muted`,
                            value: 'Use `/mute` to mute the user'
                        }
                    ])
            ] });
        }

        // Unmute the member
        try
        {
            await member.disableCommunicationUntil(null);

            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.success)
                    .setTitle('Unmuted user')
                    .addFields([
                        {
                            name: `Removed the mute from ${user.tag}`,
                            value: `Requested by ${i.user.tag}`
                        }
                    ])
            ] });
        }
        catch
        {
            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't unmute user")
                    .addFields([
                        {
                            name: `Failed to unmute ${user.tag}`,
                            value: 'The bot needs the *Time out members* permission to use this command'
                        }
                    ])
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
                .setDescription('The user to unmute')
                .setRequired(true));
    }
}
