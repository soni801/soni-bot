import {Command} from "../types/Command";
import Client from "../util/Client";
import Logger from "../util/Logger";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Message,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    User
} from "discord.js";
import {CONSTANTS} from "../util/config";

/**
 * The unban command
 *
 * @author MinAbility
 * @since 7.5.0
 * @see {@link Command}
 */
export default class Unban implements Command
{
    name = 'unban';
    description = 'Remove the ban from a user';
    client: Client;
    logger = new Logger(Unban.name);
    category: 'moderation' = 'moderation';

    /**
     * Creates a new unban command
     *
     * @param {Client} client The Client the command is attached to
     *
     * @author MinAbility
     * @since 7.5.0
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
     * @since 7.5.0
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

        // Check if the user is banned
        if (!this._userBanned(i.guildId, userId)) return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle('User not banned')
                    .addFields([
                        {
                            name: 'Failed to unban user',
                            value: 'The specified user is not banned from this server.'
                        }
                    ])
            ]
        });

        // Get unban reason
        let reason = i.options.getString('reason');
        if (!reason) reason = `Requested by ${i.user.tag}`;

        // Unban the specified user
        await i.guild.members.unban(userId, reason);

        // Refresh client banlist
        await this.client.fetchBans();

        return await i.editReply({ embeds: [
            this.client.defaultEmbed()
                .setColor(CONSTANTS.COLORS.success)
                .setTitle('Unbanned user')
                .addFields([
                    {
                        name: 'Successfully removed ban',
                        value: `Removed the ban from ${await this.client.users.fetch(userId)}`
                    },
                    {
                        name: 'Reason',
                        value: reason
                    }
                ])
        ] });
    }

    /**
     * Checks if the specified user is banned from the specified guild.
     *
     * @param guildId The guild ID to check for the user ban
     * @param userId The user ID to check for ban
     * @returns {boolean} True if the user is banned, false otherwise
     * @private
     *
     * @author Soni
     * @since 7.5.0
     */
    private _userBanned(guildId: string, userId: string): boolean
    {
        // Get guild bans
        const bans = this.client.bans.get(guildId);
        if (!bans) return false;

        // Check for user ID in the guild banlist
        return !!bans.find((user: User) => user.id === userId);
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

    /**
     * Handles autocomplete for this command interaction.
     *
     * @param {AutocompleteInteraction<"cached">} i The interaction object
     * @returns {Promise<void>} Nothing
     *
     * @author Soni
     * @since 7.5.0
     * @see {@link AutocompleteInteraction}
     */
    async handleAutocomplete(i: AutocompleteInteraction<'cached'>): Promise<void>
    {
        // Get the focused value
        const focusedValue = i.options.getFocused();

        // Get guild bans
        const bans = this.client.bans.get(i.guildId);
        if (!bans) return await i.respond([]);

        // Filter by the focused value
        const search = (user: User) =>
        {
            if (user.globalName && user.globalName.toLowerCase().includes(focusedValue.toLowerCase())) return true;
            return user.username.toLowerCase().includes(focusedValue.toLowerCase());
        };

        // TODO: Check if this will break if there are too many bans
        await i.respond(bans.filter(search).map((user: User) => ({ name: user.globalName || user.username, value: user.id })));
    }
}
