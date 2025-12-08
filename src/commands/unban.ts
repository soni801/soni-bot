import {Command} from "../types/Command";
import Client from "../util/Client";
import Logger from "../util/Logger";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Message,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder
} from "discord.js";
import {CONSTANTS} from "../util/config";

/**
 * The unban command
 *
 * @author MinAbility
 * @since 7.3.0
 * @see {@link Command}
 */
export default class Unban implements Command
{
    name = 'unban';
    description = 'Unban a user';
    client: Client;
    logger = new Logger(Unban.name);
    category: 'moderation' = 'moderation';

    /**
     * Creates a new unban command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author MinAbility
     * @since 7.4.0
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
     * @author MinAbility
     * @since 7.4.0
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

        // Make sure the bot has ban permissions
        if (!i.guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't unban user")
                    .addFields([
                        {
                            name: `Failed to unban user`,
                            value: 'The bot needs the *Ban Members* permission to use this command.'
                        }
                    ])
            ]
        });

        // Get user ID to unban
        const userId = i.options.getString('user', true);
        
        // Get unban reason
        let reason = i.options.getString('reason');
        if (!reason) reason = `Requested by ${i.user.tag}`;

        // Unban the specified user
        try
        {
            // Fetch the ban to get user info
            const ban = await i.guild.bans.fetch(userId);
            await i.guild.members.unban(userId, reason);

            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.success)
                    .setTitle('Unbanned user')
                    .addFields([
                        {
                            name: `Successfully unbanned ${ban.user.tag}`,
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
            .addStringOption(option => option.setName('user')
                .setDescription('The user to unban')
                .setRequired(true)
                .setAutocomplete(true))
            .addStringOption(option => option.setName('reason')
                .setDescription('The reason for the unban'));
    }

    async handleAutocomplete(i: AutocompleteInteraction<'cached'>): Promise<void>
    {
        const focusedValue = i.options.getFocused().toLowerCase();
        const bans = await i.guild.bans.fetch();

        const filtered = bans
            .filter(ban => 
                ban.user.tag.toLowerCase().includes(focusedValue) ||
                ban.user.id.includes(focusedValue)
            )
            .map(ban => ({
                name: `${ban.user.tag}`,
                value: ban.user.id
            }))
            .slice(0, 25);

        await i.respond(filtered);
    }
}
