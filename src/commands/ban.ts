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

        // Ban the specified user
        const user = i.options.getUser('user', true);
        try
        {
            await i.guild.members.ban(user, {reason: `Requested by ${i.user.tag}`});

            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setTitle('Banned user')
                    .addFields([
                        {
                            name: `Successfully banned ${user.tag}`,
                            value: `Requested by <@${i.user.id}>`
                        }
                    ])
            ] });
        }
        catch
        {
            return await i.editReply({ embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle("Couldn't ban user")
                    .addFields([
                        {
                            name: `Failed to ban ${user.tag}`,
                            value: 'The bot needs the *Ban Members* permission to use this command'
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
                .setDescription('The user to ban')
                .setRequired(true));
    }
}
