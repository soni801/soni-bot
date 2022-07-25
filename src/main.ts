// discord.js imports
import
{
    Client,
    CommandInteraction,
    Intents,
    Interaction,
    TextChannel,
    Message,
    User,
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    SelectMenuInteraction,
    Permissions
}
from "discord.js";

// Other imports
import { AppDataSource } from "./data-source";
import { DataSource } from "typeorm";
import { Changelog, Command } from "./types";
import { commands as commandFile } from "./commands.json";
import { changelog as changelogFile } from "./changelog.json";
import { jokes } from "./jokes.json";
import dotenv from "dotenv";
import Reminder from "./entity/Reminder";
import ReactionRole from "./entity/ReactionRole";

// Utility functions
function randomNumber(min: number, max: number) { return Math.floor(Math.random() * max) + min; }
function timestamp() { return `\x1b[2m[${new Date().toLocaleString()}]\x1b[0m`; }
function capitalizeFirstLetter(string: string) { return string.charAt(0).toUpperCase() + string.slice(1); }

class Main
{
    // Create a Client instance
    client = new Client<true>({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ],
        partials: [
            "MESSAGE",
            "REACTION"
        ]
    });

    // Define metadata
    version = process.env.npm_package_version;
    dataSource?: DataSource;

    // Load commands and changelog
    commands = commandFile as Command[];
    changelog = changelogFile as Changelog[];

    constructor()
    {
        // Format commands to comply with embed field syntax
        this.commands.forEach(command => command.name = `\`/${command.name}\``);
        this.commands.forEach(command => command.value = command.description);

        // Format changelog to comply with select menu syntax
        this.changelog.forEach(version => version.label = `v${version.version}`);
        this.changelog.forEach(version => version.value = version.version);

        // Register ready callback
        this.client.once("ready", () =>
        {
            this.client.user.setActivity("/help", { type: "LISTENING" });
            console.log(`${timestamp()} Ready!`);
        });

        // Register message callback
        this.client.on("messageCreate", message =>
        {
            // Reactions
            this.react(message, "ew", "808988372948615178");
            this.react(message, "dbrug", "808989500058894376");
        });

        // Register interaction callback
        this.client.on("interactionCreate", interaction => this.handleInteraction(interaction));

        // Register reaction creation callback
        this.client.on("messageReactionAdd", (reaction, user) => this.handleReaction(reaction, user, true));

        // Register reaction removal callback
        this.client.on("messageReactionRemove", (reaction, user) => this.handleReaction(reaction, user, false));
    }

    async start()
    {
        // Load the data source
        this.dataSource = await AppDataSource.initialize();

        // Set an interval for checking stored reminders
        setInterval(async () =>
        {
            const reminders = await this.fetchReminders(true);
            reminders.forEach(r => this.remind(r));
        }, 1000);

        // Log in to the client
        await this.client.login(process.env.TOKEN);
    }

    async fetchReminders(due: boolean, user?: string): Promise<Reminder[]>
    {
        // Fetch all reminders that are not reminded
        let reminders = await Reminder.find({ where: { reminded: false } });

        // Filter to only include due reminders if desired
        if (due) reminders = reminders.filter(r => r.due.getTime() <= new Date().getTime());

        // Filter to only include reminders for a specific user if desired
        if (user) reminders = reminders.filter(r => r.user === user);

        return reminders;
    }

    embed(name: string, fields?: any[], image?: string, footer?: { text: string, icon_url: string | null })
    {
        // This has to be of type 'any' to avoid TS2740
        const embed: any = {
            color: 0x3ba3a1,
            author: {
                name: name,
                icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
            },
            fields: fields,
            timestamp: new Date().getTime(),
            footer: footer
        };

        if (image) embed.image = {
            url: image
        };

        return embed;
    }

    helpMessage(category?: string)
    {
        // Declare the help message header that is always shown
        const header: ({ name: string; value?: string; inline?: boolean })[] = [
            {
                name: "Version",
                value: `v${this.version}`,
                inline: true
            },
            {
                name: "Changelog",
                value: "See `/changelog`",
                inline: true
            },
            {
                name: "\u200b",
                value: "\u200b"
            }
        ];

        // Show a category if supplied
        if (category)
        {
            // Declare category header
            let fields: { name: string; value?: string }[] = [
                {
                    name: `${capitalizeFirstLetter(category)} commands`,
                    value: "\u200b"
                },
            ];

            // Fetch the relevant commands
            const commandFields = this.commands.filter(command => command.category === category);

            // Add commands if any, otherwise add message stating no commands
            if (commandFields.length > 0) fields = fields.concat(commandFields);
            else fields = fields.concat([
                {
                    name: "No commands",
                    value: "There are no commands available in this category."
                },
                {
                    name: "\u200b",
                    value: "\u200b"
                }
            ]);

            return header.concat(fields);
        }

        // If no category is supplied, return the default content
        return header.concat([
            {
                name: "Welcome to Soni Bot!",
                value: "Please select a help category."
            },
            {
                name: "\u200b",
                value: "\u200b"
            }
        ]);
    }

    changelogMessage(v = this.version)
    {
        const changes = this.changelog.find(ver => ver.version === v)!.changes;
        let output = "";

        changes.forEach(c => output += `\u2022 ${c}\n`);

        return [
            {
                name: `Changelog for v${v}`,
                value: output
            }
        ];
    }

    react(message: Message, phrase: string, emoteID: string)
    {
        // Make sure the message happened in a guild
        if (!message.inGuild()) return;

        // Fetch the channel
        const channel = this.client.channels.cache.get(message.channelId);
        if (!(channel instanceof TextChannel)) return;

        // Fetch the guild
        const guild = this.client.guilds.cache.get(message.guildId);
        if (guild === undefined) return;

        // Fetch the emote
        const emote = this.client.emojis.cache.get(emoteID);
        if (emote === undefined) return;

        if (message.content.toLowerCase().startsWith(phrase) ||
            message.content.toLowerCase().includes(" " + phrase) ||
            message.content.toLowerCase().includes(":" + phrase))
            message.react(emote).then(() => console.log(`${timestamp()} Reacted with emote ${emote} to phrase '${phrase}' in #${channel.name}, ${guild.name}`));
    }

    // Several arguments have to be of type 'any[]', otherwise they break
    respond(data: { interaction: CommandInteraction<"cached"> | SelectMenuInteraction<"cached">, fields?: any[], components?: any[], image?: string })
    {
        let title: string;
        if (data.interaction instanceof CommandInteraction) title = data.interaction.commandName;
        else title = data.interaction.customId;

        // Fetch the channel
        const channel = this.client.channels.cache.get(data.interaction.channelId);
        if (!(channel instanceof TextChannel)) return;

        // Declare the message for sending
        const message = {
            content: null,
            embeds: [
                this.embed(title, data.fields, data.image, { text: `Called by ${data.interaction.user.username}`, icon_url: data.interaction.user.avatarURL() })
            ],
            components: data.components
        };

        // Reply or update original message based on interaction type
        if (data.interaction instanceof CommandInteraction) data.interaction.editReply(message).then(() => console.log(`${timestamp()} Executed command '${title}' from ${data.interaction.user.username}#${data.interaction.user.discriminator} in #${channel.name}, ${data.interaction.guild.name}`));
        else data.interaction.update(message).then(() => console.log(`${timestamp()} Responded to ${title} change from ${data.interaction.user.username}#${data.interaction.user.discriminator} in #${channel.name}, ${data.interaction.guild}`));
    }

    async remind(reminder: Reminder)
    {
        // Fetch the channel and user from the client cache
        const channel = await this.client.channels.fetch(reminder.channel);
        const user = await this.client.users.fetch(reminder.user);

        // Send the reminder
        if (channel instanceof TextChannel) await channel.send({
            content: `> ${user}`,
            embeds: [
                this.embed("remind", [
                    {
                        name: "Reminder",
                        value: reminder.content
                    }
                ])
            ]
        });

        // Log the reminder
        console.log(`${timestamp()} Reminded ${user.username}#${user.discriminator} of '${reminder.content}'`);

        // Change the reminded state of the reminder
        reminder.reminded = true;
        await reminder.save();
    }

    async handleInteraction(interaction: Interaction)
    {
        // Check that the interaction happens in a cached guild
        if (!interaction.inCachedGuild()) return;

        if (interaction.isApplicationCommand() && interaction.isCommand())
        {
            await interaction.deferReply();

            switch (interaction.commandName)
            {
                case "about":
                    this.respond({ interaction, fields: [
                        {
                            name: "What am I?",
                            value: `I am a lightweight toolkit bot developed by ${this.client.users.cache.get("443058373022318593")}. I was originally just meant for fun inside jokes, but my functionality has since expanded to include things like moderation and utility.`,
                            inline: true
                        },
                        {
                            name: "How do I function?",
                            value: "There is more details about each command in the /help command, and every command has autofill. The code is also open source and available [on GitHub](https://github.com/soni801/soni-bot/).",
                            inline: true
                        }
                    ] });
                    break;
                case "changelog":
                    this.respond({ interaction, fields: [ this.changelogMessage() ], components: [
                        {
                            type: "ACTION_ROW",
                            components: [
                                {
                                    type: "SELECT_MENU",
                                    customId: "changelog",
                                    placeholder: "Select a version",
                                    minValues: null,
                                    maxValues: null,
                                    options: this.changelog,
                                    disabled: false
                                }
                            ]
                        }
                    ] });
                    break;
                case "svensdum":
                    this.respond({ interaction, image: "https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png" });
                    break;
                case "responses":
                    this.respond({ interaction, fields: [
                        {
                            name: "Want the best selection of responses to send to your friends?",
                            value: "Check out [our response site](https://responses.yessness.com)"
                        }
                    ] });
                    break;
                case "family":
                    this.respond({ interaction, fields: [
                        {
                            name: "\u200b",
                            value: `Wanna join the family? Just tell ${this.client.users.cache.get("443058373022318593")}, and we'll figure it out.`
                        }
                    ], image: "https://cdn.yessness.com/family.png" });
                    break;
                case "uptime":
                    this.respond({ interaction, fields: [
                        {
                            name: "Soni Bot uptime",
                            value: `${Math.round(this.client.uptime / 1000 / 60)} minutes`
                        }
                    ] });
                    break;
                case "ping":
                    // Send a message
                    await interaction.editReply(":ping_pong: Testing ping");

                    // Fetch the message, and check the latency
                    const message = await interaction.fetchReply();

                    this.respond({ interaction, fields: [
                        {
                            name: ":ping_pong: Pong!",
                            value: `Soni Bot latency: ${message.createdTimestamp - interaction.createdTimestamp}ms
                            API latency: ${Math.round(this.client.ws.ping)}ms`
                        }
                    ] });
                    break;
                case "help":
                    this.respond({ interaction, fields: [ this.helpMessage() ], components: [
                        {
                            type: "ACTION_ROW",
                            components: [
                                {
                                    type: "SELECT_MENU",
                                    customId: "help",
                                    placeholder: "Select a category",
                                    minValues: null,
                                    maxValues: null,
                                    options: [
                                        {
                                            label: "Soni Bot",
                                            description: "Commands for information about the bot",
                                            value: "bot"
                                        },
                                        {
                                            label: "Useful",
                                            description: "Useful commands",
                                            value: "useful"
                                        },
                                        {
                                            label: "Moderation",
                                            description: "Commands for server moderation",
                                            value: "moderation"
                                        },
                                        {
                                            label: "Fun",
                                            description: "Fun, not so useful commands",
                                            value: "fun"
                                        }
                                    ],
                                    disabled: false
                                }
                            ]
                        }
                    ] });
                    break;
                case "8ball":
                    this.respond({ interaction, fields: [
                        {
                            name: "Question",
                            value: interaction.options.getString("question")
                        },
                        {
                            name: "Answer",
                            value: (() =>
                            {
                                switch (randomNumber(0, 12))
                                {
                                    case 0: return "why do you ask me";
                                    case 1: return "find out yourself";
                                    case 2: return "that may be the case";
                                    case 3: return "i dont think it matters";
                                    case 4: return "im not sure actually";
                                    case 5: return "ask soni";
                                    case 6: return "i cant be bothered to answer";
                                    case 7: return "idk";
                                    case 8: return "why do you feel the need to rely on 8 ball? take your own decisions.";
                                    case 9: return "you can be the judge of that";
                                    case 10: return "why would i know";
                                    case 11: return "do you expect me to know?";
                                }
                            })()
                        }
                    ] });
                    break;
                case "dice":
                    this.respond({ interaction, fields: [
                        {
                            name: "Die result",
                            value: randomNumber(1, 7).toString()
                        }
                    ] });
                    break;
                case "joke":
                    // Respond with a random joke from the list of jokes
                    this.respond({ interaction, fields: [
                        {
                            name: "Joke",
                            value: jokes[randomNumber(0, jokes.length)]
                        }
                    ] });
                    break;
                case "reminder":
                    switch (interaction.options.getSubcommand())
                    {
                        case "create":
                            // Fetch data from command
                            const content = interaction.options.getString("reminder", true);
                            let time = interaction.options.getInteger("time", true); // Modifiable to change unit
                            const unit = interaction.options.getString("unit", true);

                            // Calculate time offset in ms
                            // noinspection FallThroughInSwitchStatementJS
                            switch (unit)
                            {
                                case "days": time *= 24;
                                case "hours": time *= 60;
                                case "minutes": time *= 60;
                                case "seconds": time *= 1000;
                            }

                            // Store values
                            const user = interaction.user.id;
                            const channel = interaction.channelId;
                            const due = new Date(interaction.createdTimestamp + time);

                            // Create and save the reminder
                            const reminder = new Reminder({ user, channel, content, due });
                            await reminder.save();

                            // Send a confirmation to the user
                            this.respond({ interaction, fields: [
                                {
                                    name: "Reminder registered",
                                    value: content
                                },
                                {
                                    name: "\u200b",
                                    value: `I will remind you <t:${(due.getTime() / 1000).toFixed(0)}:R>`
                                }
                            ] });
                            break;
                        case "list":
                            // Fetch reminders for the user that called the command
                            const reminders = await this.fetchReminders(false, interaction.user.id);

                            // Determine the output (relevant reminders, stringified)
                            let output = "";
                            reminders.forEach(r => output += `\u2022 \`${r.content}\`, due <t:${(r.due.getTime() / 1000).toFixed(0)}:R>\n`);
                            if (output.length === 0) output = "You have no active reminders.\nCreate one with `/reminder create`.";

                            this.respond({ interaction, fields: [
                                {
                                    name: "Your active reminders",
                                    value: output
                                }
                            ] });
                    }
                    break;
                case "reactionrole":
                    // Make sure the user has permission to use the command
                    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return this.respond({ interaction, fields: [
                        {
                            name: "Insufficient permissions",
                            value: "You need the 'Manage Roles' permission to be able to use this command."
                        }
                    ] });

                    switch (interaction.options.getSubcommand())
                    {
                        case "create":
                            // Fetch data from command
                            const message = interaction.options.getString("message", true);
                            const emote = interaction.options.getString("emote", true);
                            const role = interaction.options.getRole("role", true);

                            // Fetch the bot user
                            const me = interaction.guild.me;
                            if (!me) return;

                            // Make sure the role is available to assign
                            if (role.comparePositionTo(me.roles.highest) > 0) return this.respond({ interaction, fields: [
                                {
                                    name: "Role has too high permissions",
                                    value: "You can only assign roles that are lower in the hierarchy than the role(s) for this bot."
                                }
                            ] });

                            // Fetch the channel and message object
                            let channel, messageObject;
                            try
                            {
                                channel = this.client.channels.cache.get(interaction.channelId) as TextChannel;
                                messageObject = await channel.messages.fetch(message);
                            }
                            catch
                            {
                                // Show an error to the user
                                return this.respond({ interaction, fields: [
                                    {
                                        name: "Incorrect channel",
                                        value: "The reaction message must be in the same channel as this command interaction"
                                    }
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
                                return this.respond({ interaction, fields: [
                                    {
                                        name: "Invalid emote",
                                        value: "The reaction emote has to either be from this server or be a global emoji"
                                    }
                                ] });
                            }

                            // Create and save the reaction role
                            const reactionRole = new ReactionRole({ message, reaction: reaction, role: role.id });
                            await reactionRole.save();

                            // Send a confirmation to the user
                            this.respond({ interaction, fields: [
                                {
                                    name: "Reaction role registered",
                                    value: "This reaction role is now active"
                                }
                            ] });
                            break;
                        case "remove":
                            this.respond({ interaction, fields: [
                                {
                                    name: "Not available",
                                    value: `This feature has not yet been implemented. Contact ${this.client.users.cache.get("443058373022318593")} if you want a reaction role to be removed.`
                                }
                            ] });
                    }
            }
        }
        else if (interaction.isMessageComponent() && interaction.isSelectMenu())
        {
            // Fetch the channel
            const channel = this.client.channels.cache.get(interaction.channelId);
            if (!(channel instanceof TextChannel)) return;

            // Respond with the change
            switch (interaction.customId)
            {
                case "help": this.respond({ interaction, fields: this.helpMessage(interaction.values[0]) }); break;
                case "changelog": this.respond({ interaction, fields: this.changelogMessage(interaction.values[0]) });
            }
        }
    }

    /**
     * Handles a reaction
     *
     * @param reaction The reaction to handle
     * @param user The user that reacted
     * @param reactionExists Whether the reaction was added or removed; `true` = added, `false` = removed
     */
    async handleReaction(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, reactionExists: boolean)
    {
        // Get all matching reaction roles
        const matchingReactionRoles = await ReactionRole.find({ where: { message: reaction.message.id, reaction: reaction.emoji.toString() } });

        if (matchingReactionRoles.length > 0)
        {
            // Get the role ID from the database
            const roleID = matchingReactionRoles[0].role;

            // Make sure nothing is partial
            user = await user.fetch();
            const message = await reaction.message.fetch();

            // Fetch the guild
            const guild = message.guild;
            if (!guild) return;

            // Fetch the GuildMember of the user
            const member = guild.members.cache.get(user.id);
            if (!member) return;

            // Fetch the role
            const role = guild.roles.cache.get(roleID);
            if (!role) return;

            // Set the role
            if (reactionExists) await member.roles.add(role);
            else await member.roles.remove(role);
            console.log(`${timestamp()} Set role '${role.name}' to ${reactionExists} on user ${user.tag} in ${guild.name}`);
        }
    }
}

dotenv.config();
const bot = new Main();
bot.start().then(() => console.log(`${timestamp()} Successfully logged in`));
