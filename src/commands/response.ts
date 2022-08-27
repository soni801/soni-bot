import axios from 'axios';
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ResponseObject } from '../types';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

/**
 * The response command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Response implements Command
{
    name = 'response';
    description = 'Post a response from responses.yessness.com';
    client: Client;
    logger = new Logger(Response.name);
    category: 'fun' = 'fun';
    private _responses: ResponseObject[];

    /**
     * Creates a new response command
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

        this.loadResponses().then(() => this.logger.info('Loaded responses'));
    }

    /**
     * Executes the command
     *
     * @param {ChatInputCommandInteraction<'cached'>} i The command interaction
     * @returns {Promise<Message<boolean>>} The reply sent by the bot
     *
     * @author Soni
     * @since 6.0.0
     * @see {@link ChatInputCommandInteraction}
     */
    async execute(i: ChatInputCommandInteraction<'cached'>)
    {
        const response = this._responses.find(r => r.id === i.options.getString('response', true));

        if (!response) return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setColor(CONSTANTS.COLORS.warning)
                    .setTitle('Responses')
                    .addFields([
                        {
                            name: 'Invalid response ID',
                            value: 'The provided response ID is not valid'
                        }
                    ])
            ]
        });

        return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setTitle(response.name)
                    .addFields([
                        {
                            name: 'This response was provided by the yessness response service',
                            value: 'Check it out for yourself at https://responses.yessness.com/.'
                        }
                    ])
                    .setImage(response.src)
            ]
        });
    }

    /**
     * Loads the responses into its class field
     *
     * @returns {Promise<void>} Nothing
     *
     * @author Soni
     * @since 6.0.0
     * @see {@link https://responses.yessness.com}
     */
    async loadResponses()
    {

        // This line looks cursed but do not worry about it please, it does its job :)
        this._responses = (await axios.get<ResponseObject[]>('https://responses.yessness.com/responses.json')).data.map((r: ResponseObject) =>
            ({
                ...r,
                value: r.id
            }));
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
            .addStringOption(option => option.setName('response')
                .setDescription('The response to post')
                .setRequired(true)
                .setAutocomplete(true)) as SlashCommandBuilder;
    }

    /**
     * Handles autocomplete for this command interaction.
     *
     * @param {AutocompleteInteraction<"cached">} i The interaction object
     * @returns {Promise<void>} Nothing
     *
     * @author theS1LV3R
     * @since 6.0.0
     */
    async handleAutocomplete(i: AutocompleteInteraction<'cached'>)
    {
        // Get the focused value
        const focusedValue = i.options.getFocused();

        // Filter the response list by entries matching the focused value
        const search = (s: string) => s.toLowerCase().replace(/['.!,?]/gi, '').includes(focusedValue);
        const filteredResponseList = this._responses.filter(r => search(r.id) || search(r.value) || search(r.name) || search(r.src)).filter((r, i) => i < 25);

        // Return the filtered response list
        await i.respond(filteredResponseList);
    }
}
