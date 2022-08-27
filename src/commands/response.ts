import axios from 'axios';
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ResponseObject } from '../types';
import type { Command } from '../types/Command';
import type Client from '../util/Client';
import { CONSTANTS } from '../util/config';
import Logger from '../util/Logger';

/**
 * The responses command
 *
 * @author Soni
 * @since 6.0.0
 * @see {@link Command}
 */
export default class Responses implements Command
{
    name = 'responses';
    description = 'Post a response from responses.yessness.com';
    client: Client;
    logger = new Logger(Responses.name);
    category: 'fun' = 'fun';
    private _responses: ResponseObject[];

    /**
     * Creates a new responses command
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
                            value: 'The response ID you provided is not valid'
                        }
                    ])
            ]
        });

        return await i.editReply({
            embeds: [
                this.client.defaultEmbed()
                    .setTitle(response.name)
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
                // @ts-ignore
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

    async handleAutocomplete(i: AutocompleteInteraction<'cached'>)
    {
        const focusedValue = i.options.getFocused();

        const search = (s: string) => s.toLowerCase().replace(/['.!,?]/gi, '').includes(focusedValue);

        const filteredResponseList = this._responses.filter(r => search(r.id)
            || search(r.value)
            || search(r.name)
            || search(r.src)
            ).filter((r, i) => i < 25);

        await i.respond(filteredResponseList)
    }
}
