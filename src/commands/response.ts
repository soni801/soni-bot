import axios from 'axios';
import {AutocompleteInteraction, ChatInputCommandInteraction, Message, SlashCommandBuilder} from 'discord.js';
import { ResponseObject } from '../types';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

// noinspection JSUnusedGlobalSymbols
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
    description = 'Post the specified response from responses.yessness.com';
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
    async execute(i: ChatInputCommandInteraction<'cached'>): Promise<Message>
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
                            name: '\u200B',
                            value: '-# Provided by https://responses.yessness.com/.'
                        }
                    ])
                    .setImage(`https://responses.yessness.com/media/${response.id}.jpg`)
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
    async loadResponses(): Promise<void>
    {
        // Add a 'value' field to the response list to be able to directly use it in the autocomplete handler
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
    async slashCommand(): Promise<SlashCommandBuilder>
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
    async handleAutocomplete(i: AutocompleteInteraction<'cached'>): Promise<void>
    {
        // Get the focused value
        const focusedValue = i.options.getFocused();

        // Filter the response list by entries matching the focused value
        const search = (s: string) => s.toLowerCase().replace(/['.!,?]/gi, '').includes(focusedValue);
        const filteredResponseList = this._responses.filter(r => search(r.id) || search(r.name)).filter((_r, i) => i < 25);

        // Return the filtered response list
        await i.respond(filteredResponseList);
    }
}
