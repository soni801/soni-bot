// Imports
import { AppDataSource } from "./data-source";
import { Client, CommandInteraction, Intents, Interaction, TextChannel, Message, Guild } from "discord.js";
import dotenv from 'dotenv';
import { commands as commandFile } from "./commands.json";
import { changelog as changelogFile } from "./changelog.json";
import { Changelog, Command } from "./types";
import { DataSource } from "typeorm";
import Reminder from "./entity/Reminder";

// Utility functions
function randomNumber(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function timestamp() { return `\x1b[2m[${new Date().toLocaleString()}]\x1b[0m`; }
function capitalizeFirstLetter(string: string) { return string.charAt(0).toUpperCase() + string.slice(1); }

class Main
{
    // Create a Client instance
    client = new Client<true>({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    version = "v5.0"; // TODO: Fetch this from package.json

    commands = commandFile as Command[];
    changelog = changelogFile as Changelog[];

    dataSource?: DataSource;

    constructor()
    {
        // Format commands to comply with embed field syntax
        this.commands.forEach(command => command.name = `\`/${command.name}\``);
        this.commands.forEach(command => command.value = command.description);

        // Format changelog to comply with select menu syntax
        this.changelog.forEach(version => version.label = version.version);
        this.changelog.forEach(version => version.value = version.version);

        // Register interaction callback
        this.client.on("interactionCreate", interaction => this.handleInteraction(interaction));

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
    }

    async start()
    {
        // Load the data source
        this.dataSource = await AppDataSource.initialize();

        // Set an interval for checking stored reminders
        setInterval(() => this.checkReminders(this), 1000);

        // Log in to the client
        await this.client.login(process.env.TOKEN);
    }

    async checkReminders(self: Main)
    {
        // Fetch all reminders in the past that are not reminded
        const reminders = (await Reminder.find({ where: { reminded: false } })).filter(r => r.due.getTime() <= new Date().getTime() );
        reminders.forEach(r => self.remind(r));
    }

    embed(name: string, fields: any)
    {
        return {
            color: 0x3ba3a1,
            author: {
                name: name,
                icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
            },
            fields: fields,
            timestamp: new Date()
        };
    }

    helpMessage(category?: string)
    {
        // Declare the help message header that is always shown
        const header: ({ name: string; value?: string; inline?: boolean })[] = [
            {
                name: "Version",
                value: this.version,
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
                name: `Changelog for ${v}`,
                value: output
            }
        ];
    }

    react(message: Message, emoteName: string, emoteID: string)
    {
        // Make sure the message happened in a guild
        if (!message.inGuild()) return;

        // Fetch the channel
        const channel = this.client.channels.cache.get(message.channelId);
        if (!(channel instanceof TextChannel)) return;

        // Fetch the guild
        const guild = this.client.guilds.cache.get(message.guildId);
        if (!(guild instanceof Guild)) return;

        if (message.content.toLowerCase().startsWith(emoteName) ||
            message.content.toLowerCase().includes(" " + emoteName) ||
            message.content.toLowerCase().includes(":" + emoteName))
        {
            try
            {
                message.react(emoteID).then(() => console.log(`${timestamp()} Reacted with emote ${emoteName} in #${channel.name}, ${guild.name}`));
            }
            catch (err)
            {
                console.log(`${timestamp()} Failed to react with emote ${emoteName} in #${channel.name}, ${guild.name} with error ${err}`);
            }
        }
    }

    respond(interaction: CommandInteraction<"cached">, fields = [] as any[], components?: any) // FIXME: Make this not of type any
    {
        // FIXME: This is cursed
        const channel = this.client.channels.cache.get(interaction.channelId)!;
        if (!(channel instanceof TextChannel)) return;

        // Declare the message for sending
        const message = {
            content: null,
            embeds: [
                this.embed(interaction.commandName, fields)
            ],
            components: components
        };

        // Reply and log
        interaction.editReply(message).then(() => console.log(`${timestamp()} Executed command '${interaction.commandName}' from ${interaction.user.username}#${interaction.user.discriminator} in #${channel.name}, ${interaction.guild.name}`));
    }

    async remind(reminder: Reminder)
    {
        // Fetch the channel from the client cache
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
        console.log(`${timestamp()} Reminded ${user.username}#${user.discriminator} of '${reminder.content}' after ${reminder.due.getTime() - reminder.createdAt.getTime()}ms`);

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
                    await this.respond(interaction, [
                        {
                            name: "What am I?",
                            value: `I am a lightweight toolkit bot developed by ${this.client.users.cache.get("443058373022318593")}. I was originally just meant for fun inside jokes, but my functionality has since expanded to include things like moderation and utility.`
                        },
                        {
                            name: "How do I function?",
                            value: "There is more details about each command in the /help command, and every command has autofill. The code is also open source and available [on GitHub](https://github.com/soni801/soni-bot/)."
                        }
                    ]);
                    break;
                case "changelog":
                    this.respond(interaction, [ this.changelogMessage() ], [
                        {
                            type: "ACTION_ROW",
                            components: [
                                {
                                    type: "SELECT_MENU",
                                    customId: "changelogSelect",
                                    placeholder: "Select a version",
                                    minValues: null,
                                    maxValues: null,
                                    options: this.changelog,
                                    disabled: false
                                }
                            ]
                        }
                    ]);
                    break;
                case "svensdum":
                    await interaction.reply("https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png");
                    break;
                case "responses":
                    this.respond(interaction, [
                        {
                            name: "Want the best selection of responses to send to your friends?",
                            value: "Check out [our response site](https://responses.yessness.com)"
                        }
                    ]);
                    break;
                case "family":
                    await interaction.reply("https://cdn.yessness.com/family.png");
                    break;
                case "uptime":
                    this.respond(interaction, [
                        {
                            name: "Soni Bot uptime",
                            value: `${Math.round(this.client.uptime / 1000 / 60)} minutes`
                        }
                    ]);
                    break;
                case "ping":
                    // Send a message
                    await interaction.editReply(":ping_pong: Testing ping");

                    // Fetch the message, and check the latency
                    const message = await interaction.fetchReply();

                    this.respond(interaction, [
                        {
                            name: ":ping_pong: Pong!",
                            value: `Soni Bot latency: ${message.createdTimestamp - interaction.createdTimestamp}ms
                            API latency: ${Math.round(this.client.ws.ping)}ms`
                        }
                    ]);
                    break;
                case "help":
                    this.respond(interaction, [ this.helpMessage() ], [
                        {
                            type: "ACTION_ROW",
                            components: [
                                {
                                    type: "SELECT_MENU",
                                    customId: "helpSelect",
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
                    ]);
                    break;
                case "8ball":
                    this.respond(interaction, [
                        {
                            name: "Question",
                            value: interaction.options.getString("question")
                        },
                        {
                            name: "Answer",
                            value: (() =>
                            {
                                switch (randomNumber(0, 11))
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
                    ]);
                    break;
                case "dice":
                    this.respond(interaction, [
                        {
                            name: "Die result",
                            value: randomNumber(1, 6).toString()
                        }
                    ]);
                    break;
                case "joke":
                    this.respond(interaction, [
                        {
                            name: "Joke",
                            value: (() =>
                            {
                                switch (randomNumber(0, 20))
                                {
                                    case 0: return "two guys stole a calendar. they got six months each.";
                                    case 1: return "Autocorrect can go straight to he'll.";
                                    case 2: return "two peanuts were walking down the street. one was a salted.";
                                    case 3: return "i asked a friend to the gym, but they never showed up. i guess the two of us aren't gonna work out.";
                                    case 4: return "today my son asked 'can i have a book mark?' and i burst into tears. 11 years old and he still doesn't know my name is brian.";
                                    case 5: return "my wife is really mad at the fact that i have no sense of direction. so i packed up my stuff and right.";
                                    case 6: return "how do you make holy water? you boil the hell out of it.";
                                    case 7: return "im reading a book about anti-gravity. its impossible to put down!";
                                    case 8: return "what do you call someone with no body and no nose? nobody knows.";
                                    case 9: return "a slice of apple pie is $2.50 in Jamaica and $3.00 in the Bahamas. these are the pie rates of the caribbean.";
                                    case 10: return "justice is a dish best served cold, if it were served warm it would be justwater.";
                                    case 11: return "if you see a robbery at an Apple Store does that make you an iWitness?";
                                    case 12: return "why did the invisible man turn down the job offer? he couldn't see himself doing it.";
                                    case 13: return "what has two butts and kills people? an assassin";
                                    case 14: return "why couldn't the bike stand up by itself? it was two tired.";
                                    case 15: return "when a woman is giving birth, she is literally kidding.";
                                    case 16: return "why was six sad? because seven eight nine.";
                                    case 17: return "what did the buffalo say to his son when he dropped him off at school? bison.";
                                    case 18: return "why did the crab never share? because he's shellfish.";
                                    case 19: return "as a lumberjack, i know that i've cut exactly 2,417 trees. i know because every time i cut one, i keep a log.";
                                    case 20: return "what do prisoners use to call each other? cell phones.";
                                }
                            })()
                        }
                    ]);
                    break;
                case "remind":
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
                    // This is done before modifying the time
                    this.respond(interaction, [
                        {
                            name: "Reminder registered",
                            value: content
                        },
                        {
                            name: "\u200b",
                            value: `I will remind you <t:${(due.getTime() / 1000).toFixed(0)}:R>`
                        }
                    ]);
            }
        }
        else if (interaction.isMessageComponent() && interaction.isSelectMenu())
        {
            // FIXME: This is cursed
            const channel = this.client.channels.cache.get(interaction.channelId)!;
            if (!(channel instanceof TextChannel)) return;

            switch (interaction.customId)
            {
                case "helpSelect": await interaction.update({embeds: [this.embed("help", this.helpMessage(interaction.values[0]))]}); break;
                case "changelogSelect": await interaction.update({embeds: [this.embed("changelog", this.changelogMessage(interaction.values[0]))]});
            }

            console.log(`${timestamp()} Responded to ${interaction.customId} change from ${interaction.user.username}#${interaction.user.discriminator} in #${channel.name}, ${interaction.guild}`);
        }
    }
}

dotenv.config();
const bot = new Main();
bot.start().then(() => console.log(`${timestamp()} Successfully logged in`));
