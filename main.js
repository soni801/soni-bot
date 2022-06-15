// Imports
const { Client, Intents } = require("discord.js");
const dotenv = require('dotenv');
const { commands } = require("./commands.json");

// Format commands to comply with embed field syntax
commands.forEach(command => command.name = `\`/${command.name}\``);
commands.forEach(command => command.value = command.description);

// Create a Client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const version = "v4.2";

// Start the bot
dotenv.config();
client.login(process.env.TOKEN).then(() => console.log(`${timestamp()} Successfully logged in`));

// Declare utility functions
function randomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function timestamp() { return `\x1b[2m[${new Date().toLocaleString()}]\x1b[0m`; }
function capitalizeFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }

function embed(name, fields)
{
    return {
        color: 0x3ba3a1,
        author: {
            name: name,
            icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
        },
        fields: fields
    };
}

function helpMessage(category)
{
    // Declare the help message header that is always shown
    const header = [
        {
            name: "Version",
            value: version,
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
        let fields = [
            {
                name: `${capitalizeFirstLetter(category)} commands`,
                value: "\u200b"
            },
        ];

        // Fetch the relevant commands
        const commandFields = commands.filter(command => command.category === category);

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

function react(message, emoteName, emoteID, serverID)
{
    if (message.guild.id === serverID)
    {
        if (message.content.toLowerCase().startsWith(emoteName) ||
            message.content.toLowerCase().includes(" " + emoteName) ||
            message.content.toLowerCase().includes(":" + emoteName))
        {
            try
            {
                message.react(message.guild.emojis.cache.get(emoteID)).then(() => console.log(`${timestamp()} Reacted with emote ${emoteName} in #${message.channel.name}, ${message.guild.name}`));
            }
            catch (err)
            {
                console.log(`${timestamp()} Failed to react with emote ${emoteName} in #${message.channel.name}, ${message.guild.name} with error ${err}`);
            }
        }
    }
}

function respond(interaction, fields = [], edit = false, components)
{
    // Declare the message for sending
    const message = {
        content: null,
        embeds: [
            embed(interaction.commandName, fields)
        ],
        components: components
    };

    // Edit or send reply based on parameters
    if (edit) interaction.editReply(message);
    else interaction.reply(message);

    // Log the action
    console.log(`${timestamp()} Executed command '${interaction.commandName}' in #${interaction.channel.name}, ${interaction.guild.name}`);
}

client.once("ready", () =>
{
    client.user.setActivity("/help", { type: "LISTENING" });
    console.log(`${timestamp()} Ready!`);
});

client.on("messageCreate", message =>
{
    // Reactions
    react(message, "ew", "808988372948615178", "599483748337319955");
    react(message, "dbrug", "808989500058894376", "599483748337319955");
});

client.on("interactionCreate", interaction =>
{
    switch (interaction.type)
    {
        case "APPLICATION_COMMAND":
            switch (interaction.commandName)
            {
                case "about":
                    respond(interaction, [
                        {
                            name: "What am I?",
                            value: `I am a lightweight toolkit bot developed by ${client.users.cache.get("443058373022318593")}. I was originally just meant for fun inside jokes, but my functionality has since expanded to include things like moderation and utility.`
                        },
                        {
                            name: "How do I function?",
                            value: "There is more details about each command in the /help command, and every command has autofill. The code is also open source and available [on GitHub](https://github.com/soni801/soni-bot/)."
                        }
                    ]);
                    break;
                case "changelog":
                    respond(interaction, [
                        {
                            name: `Changelog for ${version}:`,
                            value: `:eyes:`
                        }
                    ]);
                    break;
                case "svensdum":
                    interaction.reply("https://media.discordapp.net/attachments/757754446787641427/763366193834360832/sven.png");
                    break;
                case "responses":
                    respond(interaction, [
                        {
                            name: "Want the best selection of responses to send to your friends?",
                            value: "Check out [our response site](https://responses.yessness.com)"
                        }
                    ]);
                    break;
                case "family":
                    interaction.reply("https://cdn.yessness.com/family.png");
                    break;
                case "uptime":
                    respond(interaction, [
                        {
                            name: "Soni Bot uptime",
                            value: `${Math.round(client.uptime / 1000 / 60)} minutes`
                        }
                    ]);
                    break;
                case "ping":
                    interaction.reply(":ping_pong: Testing ping");

                    interaction.fetchReply().then(message =>
                    {
                        respond(interaction, [
                            {
                                name: ":ping_pong: Pong!",
                                value: `Soni Bot latency: ${message.createdTimestamp - interaction.createdTimestamp}ms
                            API latency: ${Math.round(client.ws.ping)}ms`
                            }
                        ], true);
                    });
                    break;
                case "help":
                    respond(interaction, [ helpMessage() ], false, [
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
                    respond(interaction, [
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
                    respond(interaction, [
                        {
                            name: "Die result",
                            value: randomNumber(1, 6).toString()
                        }
                    ]);
                    break;
                case "joke":
                    respond(interaction, [
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
                    const reminder = interaction.options.getString("reminder");
                    let time = interaction.options.getInteger("time"); // Modifiable to change unit
                    const unit = interaction.options.getString("unit");

                    // Send a confirmation to the user
                    // This is done before modifying the time
                    respond(interaction, [
                        {
                            name: "Reminder registered",
                            value: reminder
                        },
                        {
                            name: "\u200b",
                            value: `I will remind you after ${time} ${unit}`
                        }
                    ]);

                    // Modify time based on unit
                    switch (unit)
                    {
                        case "days": time *= 24;
                        case "hours": time *= 60;
                        case "minutes": time *= 60;
                        case "seconds": time *= 1000;
                    }

                    // Set a timeout for responding to the user
                    setTimeout(() => interaction.channel.send({
                        content: `Here is your reminder, ${interaction.user}`,
                        embeds: [
                            {
                                color: 0x3ba3a1,
                                author: {
                                    name: "remind",
                                    icon_url: "https://cdn.discordapp.com/avatars/755787461040537672/8d9976baa914802cab2e4c9ecd5a9b29.webp"
                                },
                                fields: [
                                    {
                                        name: "Reminder",
                                        value: reminder
                                    }
                                ]
                            }
                        ]
                    }).then(() => console.log(`${timestamp()} Reminded ${interaction.user.username}#${interaction.user.discriminator} of '${reminder}' after ${time}ms`)), time);
            }
            break;
        case "MESSAGE_COMPONENT":
            switch (interaction.customId)
            {
                case "helpSelect":
                    interaction.update({ embeds: [ embed(interaction.commandName, helpMessage(interaction.values[0])) ] });
                    console.log(`${timestamp()} Responded to ${interaction.customId} change from ${interaction.user.username} in #${interaction.channel.name}, ${interaction.guild}`);
            }
    }
});
