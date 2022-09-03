import { AutocompleteInteraction, Interaction, TextChannel } from 'discord.js';
import Changelog from '../commands/changelog';
import Help from '../commands/help';
import { event } from '../types/events';
import Client from '../util/Client';
import { CONSTANTS } from '../util/config';

/**
 * The interactionCreate event
 *
 * @param {Client<true>} client The Client to use for the event
 * @param {Interaction} i The Interaction that was created
 * @returns {Promise<Message | ChatInputCommandInteraction<"cached">>} The provided Interaction
 *
 * @author theS1LV3R
 * @since 6.0.0
 * @see {@link ClientEvents.interactionCreate}
 */
const interactionCreate: event<'interactionCreate'> = async (client: Client<true>, i: Interaction) =>
{
    // Check that the interaction happens in a cached guild
    if (!i.inCachedGuild()) return;

    // Handle autocomplete interactions
    if (i.isAutocomplete()) return handleAutocomplete(client, i);

    // Check if the interaction is a command
    if (i.isChatInputCommand() && i.isCommand())
    {
        // Get the command name
        client.logger.info(`Slash command '${i.commandName}' called by ${i.user.tag} (subcommand?: ${i.options.getSubcommand(false) || i.options.getSubcommandGroup(false) || 'none'})`);
        const command = client.commands.get(i.commandName);

        // Defer reply
        await i.deferReply();
        if (!command) return i.editReply(CONSTANTS.ERRORS.NOT_IMPLEMENTED_NOT_EXIST);

        // Execute the command
        command.execute(i).catch(e =>
        {
            client.logger.error(`An error occurred while executing command '${i.commandName}': ${e.message}`);
            console.error(e);

            return i.editReply({ embeds: [
                client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle('An error occurred')
                    .addFields([
                        {
                            name: 'The command failed to run',
                            value: CONSTANTS.ERRORS.COMMAND_RUN_ERROR
                        }
                    ])
            ] });
        });
    }
    // Check if the interaction is a select menu change
    else if (i.isMessageComponent() && i.isSelectMenu())
    {
        // Fetch the channel
        const channel = client.channels.cache.get(i.channelId);
        if (!(channel instanceof TextChannel)) return;

        // Respond with the change
        switch (i.customId)
        {
            case "help": await i.update((client.commands.get('help') as Help).helpMessage(i.values[0])); break;
            case "changelog": await i.update((client.commands.get('changelog') as Changelog).changelistMessage(i.values[0]));
        }
    }

    return i;
};

/**
 * Handles autocomplete interactions.
 *
 * @param {Client} client The Client to use for the event
 * @param {AutocompleteInteraction<"cached">} i The Interaction that was created
 * @returns {Promise<void>} Nothing
 *
 * @author theS1LV3R
 * @since 6.0.0
 */
async function handleAutocomplete(client: Client, i: AutocompleteInteraction<'cached'>)
{
    // Get the command name
    client.logger.debug(`Autocomplete called for command '${i.commandName}' by ${i.user.tag} (subcommand?: ${i.options.getSubcommand(false) || i.options.getSubcommandGroup(false) || 'none'})`);
    const command = client.commands.get(i.commandName);

    // Print any errors to the log
    if (!command) return client.logger.warn(CONSTANTS.ERRORS.NOT_IMPLEMENTED_NOT_EXIST);
    if (!command.handleAutocomplete) return client.logger.warn(CONSTANTS.ERRORS.AUTOCOMPLETE_NOT_EXIST);

    // Execute the autocomplete
    command.handleAutocomplete(i).catch(e =>
    {
        client.logger.error(`An error occurred while executing command '${i.commandName}': ${e.message}`);
        console.error(e);
    })
}

export default interactionCreate;
